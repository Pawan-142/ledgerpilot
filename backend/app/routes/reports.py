from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.report_generator import ReportGenerator
from app.services.metrics import MetricsCalculator

router = APIRouter(prefix="/report", tags=["Reports"])

@router.get("", response_model=schemas.ReportSchema)
def get_executive_report(run_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Returns executive reconciliation audit report data.
    """
    if run_id:
        db_run = db.query(models.ReconciliationRun).filter(models.ReconciliationRun.id == run_id).first()
    else:
        db_run = db.query(models.ReconciliationRun).order_by(models.ReconciliationRun.created_at.desc()).first()

    if not db_run:
        raise HTTPException(status_code=404, detail="No reconciliation run found.")

    results = db.query(models.ReconciliationResult).filter(models.ReconciliationResult.run_id == db_run.id).all()
    exceptions = db.query(models.ExceptionRecord).filter(models.ExceptionRecord.run_id == db_run.id).all()

    results_dicts = [
        {
            "id": r.id,
            "run_id": r.run_id,
            "order_id": r.order_id,
            "transaction_id": r.transaction_id,
            "settlement_id": r.settlement_id,
            "customer_name": r.customer_name,
            "order_date": r.order_date,
            "payment_date": r.payment_date,
            "settlement_date": r.settlement_date,
            "expected_amount": r.expected_amount,
            "paid_amount": r.paid_amount,
            "settled_amount": r.settled_amount,
            "difference": r.difference,
            "payment_status": r.payment_status,
            "settlement_status": r.settlement_status,
            "payment_method": r.payment_method,
            "bank_reference": r.bank_reference,
            "status": r.status,
            "ground_truth_status": r.ground_truth_status,
            "is_correct": r.is_correct,
            "auto_resolved": r.auto_resolved
        }
        for r in results
    ]

    exc_dicts = [
        {
            "id": e.id,
            "transaction_id": e.transaction_id,
            "order_id": e.order_id,
            "exception_type": e.exception_type,
            "difference": e.difference,
            "expected_amount": e.expected_amount,
            "actual_amount": e.actual_amount,
            "severity": e.severity
        }
        for e in exceptions
    ]

    perf = {
        "processing_time_ms": db_run.processing_time_ms,
        "throughput_rps": db_run.throughput_rps,
        "tolerance": db_run.tolerance
    }
    
    metrics = MetricsCalculator.calculate_all_metrics(results_dicts, perf)
    metrics["run_id"] = db_run.id
    metrics["created_at"] = db_run.created_at

    report_data = ReportGenerator.generate_executive_report(
        run_id=db_run.id,
        metrics=metrics,
        results=results_dicts,
        exceptions=exc_dicts
    )

    return report_data

@router.get("/export/csv")
def export_csv_report(run_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Export reconciled ledger results as downloadable CSV.
    """
    if run_id:
        db_run = db.query(models.ReconciliationRun).filter(models.ReconciliationRun.id == run_id).first()
    else:
        db_run = db.query(models.ReconciliationRun).order_by(models.ReconciliationRun.created_at.desc()).first()

    if not db_run:
        raise HTTPException(status_code=404, detail="No reconciliation run found.")

    results = db.query(models.ReconciliationResult).filter(models.ReconciliationResult.run_id == db_run.id).all()
    results_dicts = [
        {
            "order_id": r.order_id,
            "transaction_id": r.transaction_id,
            "settlement_id": r.settlement_id,
            "customer_name": r.customer_name,
            "order_date": r.order_date,
            "expected_amount": r.expected_amount,
            "paid_amount": r.paid_amount,
            "settled_amount": r.settled_amount,
            "difference": r.difference,
            "status": r.status,
            "ground_truth_status": r.ground_truth_status,
            "is_correct": r.is_correct,
            "auto_resolved": r.auto_resolved
        }
        for r in results
    ]

    csv_content = ReportGenerator.export_results_to_csv(results_dicts)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=ledgerpilot_audit_{db_run.id}.csv"}
    )
