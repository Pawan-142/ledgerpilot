import io
import uuid
from datetime import datetime, timezone
from typing import List, Optional
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app import models, schemas
from app.services.data_generator import generate_synthetic_dataset
from app.services.reconciliation import ReconciliationEngine
from app.services.metrics import MetricsCalculator
from app.services.exception_engine import ExceptionEngine

router = APIRouter(prefix="", tags=["Reconciliation"])

def _execute_and_persist_reconciliation(
    df_orders: pd.DataFrame,
    df_payments: pd.DataFrame,
    df_settlements: pd.DataFrame,
    df_gt: Optional[pd.DataFrame],
    tolerance: float,
    db: Session
) -> dict:
    engine = ReconciliationEngine(tolerance=tolerance)
    results, performance_meta = engine.run_reconciliation(
        orders_df=df_orders,
        payments_df=df_payments,
        settlements_df=df_settlements,
        ground_truth_df=df_gt
    )

    run_id = f"RUN-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

    # Generate Exceptions
    for idx, r in enumerate(results, start=1):
        r["id"] = f"RES-{run_id[-6:]}-{idx:03d}"
        r["run_id"] = run_id

    exceptions = ExceptionEngine.process_exceptions(results, run_id)
    
    # Calculate All Metrics
    metrics_data = MetricsCalculator.calculate_all_metrics(results, performance_meta)
    metrics_data["run_id"] = run_id
    metrics_data["created_at"] = datetime.now(timezone.utc)

    # Save to SQLite Database
    db_run = models.ReconciliationRun(
        id=run_id,
        created_at=metrics_data["created_at"],
        tolerance=tolerance,
        total_records=metrics_data["total_records"],
        matched_records=metrics_data["matched_records"],
        tolerance_matches=metrics_data["tolerance_matches"],
        amount_mismatches=metrics_data["amount_mismatches"],
        missing_payments=metrics_data["missing_payments"],
        missing_settlements=metrics_data["missing_settlements"],
        duplicates=metrics_data["duplicates"],
        date_mismatches=metrics_data["date_mismatches"],
        unresolved_records=metrics_data["unresolved_records"],
        match_rate=metrics_data["match_rate"],
        exception_rate=metrics_data["exception_rate"],
        accuracy=metrics_data["accuracy"],
        precision=metrics_data["precision"],
        recall=metrics_data["recall"],
        f1_score=metrics_data["f1_score"],
        exception_recall=metrics_data["exception_recall"],
        auto_resolution_rate=metrics_data["auto_resolution_rate"],
        processing_time_ms=metrics_data["processing_time_ms"],
        throughput_rps=metrics_data["throughput_rps"],
        status="COMPLETED"
    )
    db.add(db_run)

    # Save results
    for r in results:
        res_m = models.ReconciliationResult(
            id=r["id"],
            run_id=run_id,
            order_id=r.get("order_id"),
            transaction_id=r.get("transaction_id"),
            settlement_id=r.get("settlement_id"),
            customer_name=r.get("customer_name"),
            order_date=r.get("order_date"),
            payment_date=r.get("payment_date"),
            settlement_date=r.get("settlement_date"),
            expected_amount=r.get("expected_amount"),
            paid_amount=r.get("paid_amount"),
            settled_amount=r.get("settled_amount"),
            difference=r.get("difference", 0.0),
            payment_status=r.get("payment_status"),
            settlement_status=r.get("settlement_status"),
            payment_method=r.get("payment_method"),
            bank_reference=r.get("bank_reference"),
            status=r.get("status"),
            ground_truth_status=r.get("ground_truth_status"),
            is_correct=r.get("is_correct", True),
            auto_resolved=r.get("auto_resolved", False)
        )
        db.add(res_m)

    # Save exceptions
    for e in exceptions:
        exc_m = models.ExceptionRecord(
            id=e["id"],
            run_id=run_id,
            result_id=e["result_id"],
            transaction_id=e.get("transaction_id"),
            order_id=e.get("order_id"),
            exception_type=e.get("exception_type"),
            expected_amount=e.get("expected_amount"),
            actual_amount=e.get("actual_amount"),
            difference=e.get("difference", 0.0),
            severity=e.get("severity"),
            resolution_status=e.get("resolution_status"),
            explanation=e.get("explanation"),
            recommended_action=e.get("recommended_action")
        )
        db.add(exc_m)

    db.commit()

    sorted_exceptions = sorted(exceptions, key=lambda x: x.get("difference", 0.0), reverse=True)
    metrics_data["top_exceptions"] = sorted_exceptions[:10]
    return metrics_data

@router.post("/reconcile", response_model=schemas.SummaryMetricsSchema)
def trigger_reconciliation(
    payload: schemas.ReconcileRequest = schemas.ReconcileRequest(),
    db: Session = Depends(get_db)
):
    """
    Triggers complete deterministic 3-way reconciliation across synthetic feeds.
    Measures runtime, calculates accuracy against ground truth, and stores run in SQLite.
    """
    orders_csv = settings.DATA_DIR / "orders.csv"
    payments_csv = settings.DATA_DIR / "payments.csv"
    settlements_csv = settings.DATA_DIR / "settlements.csv"
    gt_csv = settings.DATA_DIR / "ground_truth.csv"

    # Regenerate or generate if files don't exist
    if payload.force_regenerate or not orders_csv.exists() or not payments_csv.exists() or not settlements_csv.exists():
        generate_synthetic_dataset(output_dir=settings.DATA_DIR, total_records=120)

    try:
        df_orders = pd.read_csv(orders_csv)
        df_payments = pd.read_csv(payments_csv)
        df_settlements = pd.read_csv(settlements_csv)
        df_gt = pd.read_csv(gt_csv) if gt_csv.exists() else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read dataset feeds: {str(e)}")

    tolerance = payload.tolerance if payload.tolerance is not None else settings.DEFAULT_TOLERANCE
    return _execute_and_persist_reconciliation(df_orders, df_payments, df_settlements, df_gt, tolerance, db)

@router.post("/reconcile/upload", response_model=schemas.SummaryMetricsSchema)
async def upload_and_reconcile_custom(
    orders_file: UploadFile = File(...),
    payments_file: UploadFile = File(...),
    settlements_file: UploadFile = File(...),
    ground_truth_file: Optional[UploadFile] = File(None),
    tolerance: float = Form(10.0),
    db: Session = Depends(get_db)
):
    """
    Ingests custom user-provided CSV feeds (Orders, Payments, Settlements, and optional Ground Truth),
    normalizes the datasets, and runs the full 3-way reconciliation engine.
    """
    try:
        orders_bytes = await orders_file.read()
        payments_bytes = await payments_file.read()
        settlements_bytes = await settlements_file.read()

        df_orders = pd.read_csv(io.BytesIO(orders_bytes))
        df_payments = pd.read_csv(io.BytesIO(payments_bytes))
        df_settlements = pd.read_csv(io.BytesIO(settlements_bytes))

        df_gt = None
        if ground_truth_file:
            gt_bytes = await ground_truth_file.read()
            if gt_bytes:
                df_gt = pd.read_csv(io.BytesIO(gt_bytes))

        return _execute_and_persist_reconciliation(df_orders, df_payments, df_settlements, df_gt, tolerance, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse and reconcile uploaded CSV files: {str(e)}")

@router.get("/summary", response_model=schemas.SummaryMetricsSchema)
def get_current_summary(run_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Returns summary metrics for the latest or specified reconciliation run.
    """
    if run_id:
        db_run = db.query(models.ReconciliationRun).filter(models.ReconciliationRun.id == run_id).first()
    else:
        db_run = db.query(models.ReconciliationRun).order_by(models.ReconciliationRun.created_at.desc()).first()

    if not db_run:
        return trigger_reconciliation(schemas.ReconcileRequest(), db)

    results = db.query(models.ReconciliationResult).filter(models.ReconciliationResult.run_id == db_run.id).all()
    results_dicts = [
        {
            "id": r.id,
            "status": r.status,
            "ground_truth_status": r.ground_truth_status,
            "is_correct": r.is_correct,
            "auto_resolved": r.auto_resolved,
            "difference": r.difference
        }
        for r in results
    ]
    
    perf = {
        "processing_time_ms": db_run.processing_time_ms,
        "throughput_rps": db_run.throughput_rps,
        "tolerance": db_run.tolerance
    }
    
    metrics = MetricsCalculator.calculate_all_metrics(results_dicts, perf)
    metrics["run_id"] = db_run.id
    metrics["created_at"] = db_run.created_at

    exc_records = db.query(models.ExceptionRecord).filter(models.ExceptionRecord.run_id == db_run.id).order_by(models.ExceptionRecord.difference.desc()).limit(10).all()
    metrics["top_exceptions"] = [schemas.ExceptionSchema.model_validate(e) for e in exc_records]

    return metrics

@router.get("/runs", response_model=List[schemas.RunHistoryItem])
def list_reconciliation_runs(limit: int = 10, db: Session = Depends(get_db)):
    """
    Returns past reconciliation run audit history.
    """
    runs = db.query(models.ReconciliationRun).order_by(models.ReconciliationRun.created_at.desc()).limit(limit).all()
    history = []
    for r in runs:
        exc_count = r.total_records - (r.matched_records + r.tolerance_matches)
        history.append({
            "id": r.id,
            "created_at": r.created_at,
            "tolerance": r.tolerance,
            "total_records": r.total_records,
            "matched_records": r.matched_records + r.tolerance_matches,
            "exception_count": exc_count,
            "match_rate": r.match_rate,
            "accuracy": r.accuracy,
            "throughput_rps": r.throughput_rps,
            "processing_time_ms": r.processing_time_ms,
            "status": r.status
        })
    return history
