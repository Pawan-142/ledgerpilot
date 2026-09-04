from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/exceptions", tags=["Exceptions"])

@router.get("", response_model=List[schemas.ExceptionSchema])
def list_exceptions(
    run_id: Optional[str] = None,
    exception_type: Optional[str] = None,
    severity: Optional[str] = None,
    resolution_status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Returns exception records across the reconciliation run with severity and remediation status.
    """
    if not run_id:
        latest_run = db.query(models.ReconciliationRun).order_by(models.ReconciliationRun.created_at.desc()).first()
        if not latest_run:
            return []
        run_id = latest_run.id

    query = db.query(models.ExceptionRecord).filter(models.ExceptionRecord.run_id == run_id)

    if exception_type and exception_type != "ALL":
        query = query.filter(models.ExceptionRecord.exception_type == exception_type)

    if severity and severity != "ALL":
        query = query.filter(models.ExceptionRecord.severity == severity)

    if resolution_status and resolution_status != "ALL":
        query = query.filter(models.ExceptionRecord.resolution_status == resolution_status)

    if search:
        s = f"%{search.strip().upper()}%"
        query = query.filter(
            or_(
                models.ExceptionRecord.transaction_id.ilike(s),
                models.ExceptionRecord.order_id.ilike(s),
                models.ExceptionRecord.id.ilike(s)
            )
        )

    # Order by discrepancy / severity priority
    exceptions = query.order_by(models.ExceptionRecord.difference.desc()).offset(offset).limit(limit).all()
    
    # Populate customer name from associated result
    res_list = []
    for e in exceptions:
        schema_obj = schemas.ExceptionSchema.model_validate(e)
        if e.result and e.result.customer_name:
            schema_obj.customer_name = e.result.customer_name
        res_list.append(schema_obj)
        
    return res_list

@router.post("/bulk-resolve", response_model=schemas.BulkResolveResponse)
def bulk_resolve_exceptions(
    payload: schemas.BulkResolveRequest,
    db: Session = Depends(get_db)
):
    """
    Bulk auto-remediates eligible exceptions (e.g. all MDR Fee variances or all low-variance items).
    """
    latest_run = db.query(models.ReconciliationRun).order_by(models.ReconciliationRun.created_at.desc()).first()
    if not latest_run:
        raise HTTPException(status_code=400, detail="No active reconciliation run found.")

    query = db.query(models.ExceptionRecord).filter(
        models.ExceptionRecord.run_id == latest_run.id,
        models.ExceptionRecord.resolution_status != "RESOLVED"
    )

    if payload.exception_type and payload.exception_type != "ALL":
        query = query.filter(models.ExceptionRecord.exception_type == payload.exception_type)

    if payload.max_variance is not None and payload.max_variance > 0:
        query = query.filter(models.ExceptionRecord.difference <= payload.max_variance)

    target_exceptions = query.all()
    count = len(target_exceptions)

    action_label_map = {
        "FEE_ADJUSTMENT": "Fee Adjustment Journal Entry Posted",
        "GATEWAY_RESYNC": "Gateway Webhook Re-polled & Matched",
        "MANUAL_WAIVER": "Variance Approved / Waived by FinOps Manager",
        "DISPUTE_RAISED": "Formal Dispute Raised with Partner Bank Desk"
    }
    action_text = action_label_map.get(payload.action, payload.action)

    for exc in target_exceptions:
        exc.resolution_status = "RESOLVED"
        exc.recommended_action = f"RESOLVED: {action_text} [Bulk Action by {payload.operator_name}]"
        if exc.result:
            exc.result.auto_resolved = True

    db.commit()

    remaining = db.query(models.ExceptionRecord).filter(
        models.ExceptionRecord.run_id == latest_run.id,
        models.ExceptionRecord.resolution_status != "RESOLVED"
    ).count()

    return schemas.BulkResolveResponse(
        resolved_count=count,
        action_applied=payload.action,
        message=f"Successfully bulk-remediated {count} exception(s) via {action_text}.",
        remaining_unresolved=remaining
    )

@router.get("/{exception_id}", response_model=schemas.ExceptionSchema)
def get_exception(exception_id: str, db: Session = Depends(get_db)):
    """
    Fetch single exception record by ID.
    """
    clean_id = exception_id.strip().upper()
    exc = db.query(models.ExceptionRecord).filter(
        or_(
            models.ExceptionRecord.id == clean_id,
            models.ExceptionRecord.transaction_id == clean_id,
            models.ExceptionRecord.order_id == clean_id
        )
    ).first()

    if not exc:
        raise HTTPException(status_code=404, detail=f"Exception '{exception_id}' not found.")

    schema_obj = schemas.ExceptionSchema.model_validate(exc)
    if exc.result and exc.result.customer_name:
        schema_obj.customer_name = exc.result.customer_name
    return schema_obj

@router.post("/{exception_id}/resolve", response_model=schemas.ExceptionSchema)
def resolve_exception(
    exception_id: str,
    payload: schemas.ResolveExceptionRequest,
    db: Session = Depends(get_db)
):
    """
    Performs 1-click remediation actions on exceptions (Fee Adjustment, Gateway Resync, Manual Waiver, Dispute Raised).
    """
    clean_id = exception_id.strip().upper()
    exc = db.query(models.ExceptionRecord).filter(
        or_(
            models.ExceptionRecord.id == clean_id,
            models.ExceptionRecord.transaction_id == clean_id,
            models.ExceptionRecord.order_id == clean_id
        )
    ).first()

    if not exc:
        raise HTTPException(status_code=404, detail=f"Exception '{exception_id}' not found.")

    action_label_map = {
        "FEE_ADJUSTMENT": "Fee Adjustment Journal Entry Posted",
        "GATEWAY_RESYNC": "Gateway Webhook Re-polled & Matched",
        "MANUAL_WAIVER": "Variance Approved / Waived by FinOps Manager",
        "DISPUTE_RAISED": "Formal Dispute Raised with Partner Bank Desk"
    }

    action_text = action_label_map.get(payload.action, payload.action)
    note_str = f" | Note: {payload.note}" if payload.note else ""
    operator_str = f" [By {payload.operator_name or 'FinOps Lead'}]"

    exc.resolution_status = "RESOLVED"
    exc.recommended_action = f"RESOLVED: {action_text}{note_str}{operator_str}"
    
    if exc.result:
        exc.result.auto_resolved = True

    db.commit()
    db.refresh(exc)

    schema_obj = schemas.ExceptionSchema.model_validate(exc)
    if exc.result and exc.result.customer_name:
        schema_obj.customer_name = exc.result.customer_name
    return schema_obj

