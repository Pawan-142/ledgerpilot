from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app import models, schemas
from app.services.groq_agent import groq_agent
from app.services.metrics import MetricsCalculator

router = APIRouter(prefix="/ai", tags=["AI Copilot & Investigation"])

@router.post("/investigate", response_model=schemas.AIStructuredInvestigation)
def investigate_transaction_ai(
    payload: schemas.AIInvestigateRequest,
    db: Session = Depends(get_db)
):
    """
    Investigates a specific transaction using Groq LLM (or deterministic fallback)
    with strict grounded evidence constraints.
    """
    identifier = payload.transaction_id or payload.result_id or payload.order_id
    if not identifier:
        raise HTTPException(status_code=400, detail="Must provide transaction_id, result_id, or order_id.")

    clean_id = identifier.strip().upper()
    
    # Locate transaction in database
    txn = db.query(models.ReconciliationResult).filter(
        or_(
            models.ReconciliationResult.id == identifier,
            models.ReconciliationResult.transaction_id == clean_id,
            models.ReconciliationResult.order_id == clean_id
        )
    ).first()

    if not txn:
        raise HTTPException(status_code=404, detail=f"Transaction record '{identifier}' not found.")

    # Check if we have cached AI investigation in exception record
    if txn.exception and txn.exception.ai_investigation:
        cached = txn.exception.ai_investigation
        return schemas.AIStructuredInvestigation(**cached)

    txn_dict = {
        "order_id": txn.order_id,
        "transaction_id": txn.transaction_id,
        "settlement_id": txn.settlement_id,
        "customer_name": txn.customer_name,
        "expected_amount": txn.expected_amount,
        "paid_amount": txn.paid_amount,
        "settled_amount": txn.settled_amount,
        "difference": txn.difference,
        "payment_status": txn.payment_status,
        "settlement_status": txn.settlement_status,
        "payment_method": txn.payment_method,
        "bank_reference": txn.bank_reference,
        "status": txn.status,
        "auto_resolved": txn.auto_resolved
    }

    # Run Groq Investigation
    investigation_result = groq_agent.investigate_transaction(txn_dict)

    # Cache result if exception record exists
    if txn.exception:
        txn.exception.ai_investigation = investigation_result
        db.commit()

    return schemas.AIStructuredInvestigation(**investigation_result)

@router.post("/ask", response_model=schemas.AIChatResponse)
def copilot_chat(
    payload: schemas.AIChatRequest,
    db: Session = Depends(get_db)
):
    """
    Finance Operations Copilot: Answers questions about the active batch using
    summarized context and verified statistics.
    """
    run_id = payload.run_id
    if not run_id:
        latest_run = db.query(models.ReconciliationRun).order_by(models.ReconciliationRun.created_at.desc()).first()
        if not latest_run:
            raise HTTPException(status_code=400, detail="No reconciliation run found. Run reconciliation first.")
        run_id = latest_run.id
    else:
        latest_run = db.query(models.ReconciliationRun).filter(models.ReconciliationRun.id == run_id).first()
        if not latest_run:
            raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    # Fetch top exceptions
    exc_records = db.query(models.ExceptionRecord).filter(
        models.ExceptionRecord.run_id == run_id
    ).order_by(models.ExceptionRecord.difference.desc()).limit(12).all()

    top_exc_dicts = [
        {
            "transaction_id": e.transaction_id,
            "order_id": e.order_id,
            "exception_type": e.exception_type,
            "difference": e.difference,
            "expected_amount": e.expected_amount,
            "actual_amount": e.actual_amount,
            "severity": e.severity
        }
        for e in exc_records
    ]

    batch_summary = {
        "run_id": latest_run.id,
        "total_records": latest_run.total_records,
        "matched_records": latest_run.matched_records,
        "tolerance_matches": latest_run.tolerance_matches,
        "amount_mismatches": latest_run.amount_mismatches,
        "missing_payments": latest_run.missing_payments,
        "missing_settlements": latest_run.missing_settlements,
        "duplicates": latest_run.duplicates,
        "date_mismatches": latest_run.date_mismatches,
        "unresolved_records": latest_run.unresolved_records,
        "match_rate": latest_run.match_rate,
        "exception_rate": latest_run.exception_rate,
        "accuracy": latest_run.accuracy,
        "exception_recall": latest_run.exception_recall,
        "auto_resolution_rate": latest_run.auto_resolution_rate,
        "processing_time_ms": latest_run.processing_time_ms,
        "throughput_rps": latest_run.throughput_rps,
        "tolerance": latest_run.tolerance
    }

    # Ask Groq Copilot
    response = groq_agent.answer_copilot_question(
        question=payload.message,
        batch_summary=batch_summary,
        top_exceptions=top_exc_dicts
    )

    return schemas.AIChatResponse(**response)

@router.post("/draft-dispute", response_model=schemas.AIDisputeResponse)
def generate_dispute_communication(
    payload: schemas.AIDisputeRequest,
    db: Session = Depends(get_db)
):
    """
    Generates a formal, evidence-backed partner dispute notice or email for Bank Nodal or Gateway Support.
    """
    identifier = payload.transaction_id or payload.order_id
    if not identifier:
        raise HTTPException(status_code=400, detail="Must provide transaction_id or order_id.")

    clean_id = identifier.strip().upper()
    txn = db.query(models.ReconciliationResult).filter(
        or_(
            models.ReconciliationResult.transaction_id == clean_id,
            models.ReconciliationResult.order_id == clean_id,
            models.ReconciliationResult.id == identifier
        )
    ).first()

    if not txn:
        raise HTTPException(status_code=404, detail=f"Transaction record '{identifier}' not found.")

    txn_dict = {
        "order_id": txn.order_id,
        "transaction_id": txn.transaction_id,
        "settlement_id": txn.settlement_id,
        "customer_name": txn.customer_name,
        "expected_amount": txn.expected_amount,
        "paid_amount": txn.paid_amount,
        "settled_amount": txn.settled_amount,
        "difference": txn.difference,
        "payment_status": txn.payment_status,
        "settlement_status": txn.settlement_status,
        "payment_method": txn.payment_method,
        "bank_reference": txn.bank_reference,
        "status": txn.status
    }

    result = groq_agent.draft_dispute_communication(
        transaction_data=txn_dict,
        recipient_type=payload.recipient_type or "bank",
        custom_instructions=payload.custom_instructions
    )

    return schemas.AIDisputeResponse(**result)

