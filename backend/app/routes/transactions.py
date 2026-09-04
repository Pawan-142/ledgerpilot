from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[schemas.ReconciliationResultSchema])
def list_transactions(
    run_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    limit: int = 150,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Returns filtered reconciliation ledger records with multi-source metadata.
    """
    # If run_id not provided, pick latest run
    if not run_id:
        latest_run = db.query(models.ReconciliationRun).order_by(models.ReconciliationRun.created_at.desc()).first()
        if not latest_run:
            return []
        run_id = latest_run.id

    query = db.query(models.ReconciliationResult).filter(models.ReconciliationResult.run_id == run_id)

    if status and status != "ALL":
        if status == "EXCEPTIONS":
            query = query.filter(models.ReconciliationResult.status.notin_(["MATCHED", "MATCHED_WITH_TOLERANCE"]))
        else:
            query = query.filter(models.ReconciliationResult.status == status)

    if search:
        s = f"%{search.strip().upper()}%"
        s_raw = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.ReconciliationResult.transaction_id.ilike(s),
                models.ReconciliationResult.order_id.ilike(s),
                models.ReconciliationResult.settlement_id.ilike(s),
                models.ReconciliationResult.customer_name.ilike(s_raw),
                models.ReconciliationResult.bank_reference.ilike(s)
            )
        )

    if min_amount is not None:
        query = query.filter(models.ReconciliationResult.expected_amount >= min_amount)

    if max_amount is not None:
        query = query.filter(models.ReconciliationResult.expected_amount <= max_amount)

    results = query.offset(offset).limit(limit).all()
    return results

@router.get("/{identifier}", response_model=schemas.ReconciliationResultSchema)
def get_transaction(identifier: str, run_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Fetch single transaction investigation record by Result ID, Transaction ID, or Order ID.
    """
    clean_id = identifier.strip().upper()
    
    query = db.query(models.ReconciliationResult)
    if run_id:
        query = query.filter(models.ReconciliationResult.run_id == run_id)
    else:
        latest_run = db.query(models.ReconciliationRun).order_by(models.ReconciliationRun.created_at.desc()).first()
        if latest_run:
            query = query.filter(models.ReconciliationResult.run_id == latest_run.id)

    res = query.filter(
        or_(
            models.ReconciliationResult.id == identifier,
            models.ReconciliationResult.transaction_id == clean_id,
            models.ReconciliationResult.order_id == clean_id,
            models.ReconciliationResult.settlement_id == clean_id
        )
    ).first()

    if not res:
        raise HTTPException(status_code=404, detail=f"Transaction '{identifier}' not found in active batch.")

    return res
