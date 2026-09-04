from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class ReconcileRequest(BaseModel):
    tolerance: Optional[float] = Field(default=10.0, description="Amount tolerance in INR")
    force_regenerate: Optional[bool] = Field(default=False, description="Re-generate synthetic dataset")

class ExceptionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    result_id: str
    transaction_id: Optional[str] = None
    order_id: Optional[str] = None
    customer_name: Optional[str] = None
    exception_type: str
    expected_amount: Optional[float] = None
    actual_amount: Optional[float] = None
    difference: float = 0.0
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    resolution_status: str # AUTO_RESOLVED, REQUIRES_REVIEW, RESOLVED
    explanation: Optional[str] = None
    recommended_action: Optional[str] = None
    ai_investigation: Optional[Dict[str, Any]] = None

class ReconciliationResultSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    order_id: Optional[str] = None
    transaction_id: Optional[str] = None
    settlement_id: Optional[str] = None
    customer_name: Optional[str] = None
    order_date: Optional[str] = None
    payment_date: Optional[str] = None
    settlement_date: Optional[str] = None
    expected_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    settled_amount: Optional[float] = None
    difference: float = 0.0
    payment_status: Optional[str] = None
    settlement_status: Optional[str] = None
    payment_method: Optional[str] = None
    bank_reference: Optional[str] = None
    status: str
    ground_truth_status: Optional[str] = None
    is_correct: bool = True
    auto_resolved: bool = False
    exception: Optional[ExceptionSchema] = None

class CategoryCount(BaseModel):
    category: str
    label: str
    count: int
    percentage: float
    color: str
    total_variance: float = 0.0

class SummaryMetricsSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    run_id: str
    created_at: datetime
    tolerance: float
    total_records: int
    matched_records: int
    tolerance_matches: int
    amount_mismatches: int
    missing_payments: int
    missing_settlements: int
    duplicates: int
    date_mismatches: int
    unresolved_records: int
    total_unresolved_variance: float = 0.0
    
    match_rate: float
    exception_rate: float
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    exception_recall: float
    auto_resolution_rate: float
    
    processing_time_ms: float
    throughput_rps: float
    
    status_distribution: List[CategoryCount]
    exception_breakdown: List[CategoryCount]
    top_exceptions: List[ExceptionSchema] = []

class RunHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    tolerance: float
    total_records: int
    matched_records: int
    exception_count: int
    match_rate: float
    accuracy: float
    throughput_rps: float
    processing_time_ms: float
    status: str

class AIInvestigateRequest(BaseModel):
    transaction_id: Optional[str] = None
    result_id: Optional[str] = None
    order_id: Optional[str] = None

class AIStructuredInvestigation(BaseModel):
    summary: str
    evidence: List[str]
    likely_cause: str
    recommended_action: str
    confidence: float
    requires_human_review: bool
    is_ai_generated: bool = True
    model_used: Optional[str] = None

class AIChatMessage(BaseModel):
    role: str # user, assistant, system
    content: str
    timestamp: Optional[datetime] = None

class AIChatRequest(BaseModel):
    message: str
    run_id: Optional[str] = None
    context_filters: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    answer: str
    grounded_stats: Optional[Dict[str, Any]] = None
    suggested_followups: List[str] = []
    is_ai_generated: bool = True
    model_used: Optional[str] = None

class ReportSchema(BaseModel):
    report_id: str
    batch_id: str
    generated_at: datetime
    metrics: SummaryMetricsSchema
    high_value_unresolved: List[ReconciliationResultSchema]
    top_exception_categories: List[CategoryCount]
    executive_summary: str
    actionable_recommendations: List[str]

class ResolveExceptionRequest(BaseModel):
    action: str = Field(..., description="FEE_ADJUSTMENT, GATEWAY_RESYNC, MANUAL_WAIVER, DISPUTE_RAISED")
    note: Optional[str] = None
    operator_name: Optional[str] = "FinOps Lead"

class BulkResolveRequest(BaseModel):
    action: str = Field(default="FEE_ADJUSTMENT", description="FEE_ADJUSTMENT | GATEWAY_RESYNC | MANUAL_WAIVER")
    exception_type: Optional[str] = Field(default="AMOUNT_MISMATCH", description="AMOUNT_MISMATCH or ALL")
    max_variance: Optional[float] = None
    operator_name: Optional[str] = "FinOps Controller Auto-Remediation"
    note: Optional[str] = "Bulk auto-remediated via FinOps batch operations"

class BulkResolveResponse(BaseModel):
    resolved_count: int
    action_applied: str
    message: str
    remaining_unresolved: int

class AIDisputeRequest(BaseModel):
    transaction_id: Optional[str] = None
    order_id: Optional[str] = None
    recipient_type: Optional[str] = Field(default="bank", description="'bank', 'gateway', or 'internal'")
    custom_instructions: Optional[str] = None

class AIDisputeResponse(BaseModel):
    subject: str
    recipient: str
    recipient_type: str
    body: str
    evidence_summary: List[str] = []
    is_ai_generated: bool = True
    model_used: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    dataset_ready: bool
    record_count: int
    groq_configured: bool
    groq_model: str
    database_connected: bool

