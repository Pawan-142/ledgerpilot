from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class ReconciliationRun(Base):
    __tablename__ = "reconciliation_runs"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    tolerance = Column(Float, default=10.0)
    total_records = Column(Integer, default=0)
    matched_records = Column(Integer, default=0)
    tolerance_matches = Column(Integer, default=0)
    amount_mismatches = Column(Integer, default=0)
    missing_payments = Column(Integer, default=0)
    missing_settlements = Column(Integer, default=0)
    duplicates = Column(Integer, default=0)
    date_mismatches = Column(Integer, default=0)
    unresolved_records = Column(Integer, default=0)
    
    match_rate = Column(Float, default=0.0)
    exception_rate = Column(Float, default=0.0)
    accuracy = Column(Float, default=0.0)
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    exception_recall = Column(Float, default=0.0)
    auto_resolution_rate = Column(Float, default=0.0)
    
    processing_time_ms = Column(Float, default=0.0)
    throughput_rps = Column(Float, default=0.0)
    
    status = Column(String, default="COMPLETED")
    
    results = relationship("ReconciliationResult", back_populates="run", cascade="all, delete-orphan")
    exceptions = relationship("ExceptionRecord", back_populates="run", cascade="all, delete-orphan")

class ReconciliationResult(Base):
    __tablename__ = "reconciliation_results"

    id = Column(String, primary_key=True, index=True)
    run_id = Column(String, ForeignKey("reconciliation_runs.id"), index=True)
    order_id = Column(String, index=True, nullable=True)
    transaction_id = Column(String, index=True, nullable=True)
    settlement_id = Column(String, index=True, nullable=True)
    
    customer_name = Column(String, nullable=True)
    order_date = Column(String, nullable=True)
    payment_date = Column(String, nullable=True)
    settlement_date = Column(String, nullable=True)
    
    expected_amount = Column(Float, nullable=True)
    paid_amount = Column(Float, nullable=True)
    settled_amount = Column(Float, nullable=True)
    difference = Column(Float, default=0.0)
    
    payment_status = Column(String, nullable=True)
    settlement_status = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)
    bank_reference = Column(String, nullable=True)
    
    status = Column(String, index=True) # MATCHED, MATCHED_WITH_TOLERANCE, AMOUNT_MISMATCH, etc.
    ground_truth_status = Column(String, nullable=True)
    is_correct = Column(Boolean, default=True)
    auto_resolved = Column(Boolean, default=False)
    
    run = relationship("ReconciliationRun", back_populates="results")
    exception = relationship("ExceptionRecord", back_populates="result", uselist=False, cascade="all, delete-orphan")

class ExceptionRecord(Base):
    __tablename__ = "exceptions"

    id = Column(String, primary_key=True, index=True) # EXP-XXXX
    run_id = Column(String, ForeignKey("reconciliation_runs.id"), index=True)
    result_id = Column(String, ForeignKey("reconciliation_results.id"), unique=True)
    transaction_id = Column(String, index=True, nullable=True)
    order_id = Column(String, index=True, nullable=True)
    
    exception_type = Column(String, index=True) # AMOUNT_MISMATCH, MISSING_PAYMENT, MISSING_SETTLEMENT, etc.
    expected_amount = Column(Float, nullable=True)
    actual_amount = Column(Float, nullable=True)
    difference = Column(Float, default=0.0)
    severity = Column(String, index=True) # LOW, MEDIUM, HIGH, CRITICAL
    
    resolution_status = Column(String, default="REQUIRES_REVIEW") # AUTO_RESOLVED, REQUIRES_REVIEW, RESOLVED
    explanation = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    
    ai_investigation = Column(JSON, nullable=True) # Cached Groq investigation result
    
    run = relationship("ReconciliationRun", back_populates="exceptions")
    result = relationship("ReconciliationResult", back_populates="exception")
