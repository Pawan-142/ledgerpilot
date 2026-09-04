from typing import List, Dict, Any, Optional

class ExceptionEngine:
    """
    Dedicated financial exception engine.
    Analyzes discrepancies, scores operational severity, and generates
    grounded baseline explanations and remediation recommendations.
    """
    
    @staticmethod
    def process_exceptions(results: List[Dict[str, Any]], run_id: str) -> List[Dict[str, Any]]:
        exceptions: List[Dict[str, Any]] = []
        
        for idx, r in enumerate(results, start=1):
            status = r.get("status")
            if status == "MATCHED":
                continue # No exception for perfect matches
                
            exp_id = f"EXP-{run_id[-6:]}-{idx:03d}"
            diff = r.get("difference") or 0.0
            expected_amt = r.get("expected_amount") or 0.0
            paid_amt = r.get("paid_amount")
            settled_amt = r.get("settled_amount")
            
            # Severity classification
            severity = ExceptionEngine._calculate_severity(status, diff, expected_amt)
            
            # Resolution status
            resolution_status = "AUTO_RESOLVED" if r.get("auto_resolved") else "REQUIRES_REVIEW"
            
            # Deterministic explanation and action
            explanation, recommended_action = ExceptionEngine._generate_deterministic_analysis(
                status=status,
                diff=diff,
                expected_amt=expected_amt,
                paid_amt=paid_amt,
                settled_amt=settled_amt,
                order_id=r.get("order_id"),
                txn_id=r.get("transaction_id"),
                stl_id=r.get("settlement_id"),
                payment_status=r.get("payment_status"),
                settlement_status=r.get("settlement_status")
            )
            
            exc_record = {
                "id": exp_id,
                "run_id": run_id,
                "result_id": r.get("id"),
                "transaction_id": r.get("transaction_id"),
                "order_id": r.get("order_id"),
                "customer_name": r.get("customer_name"),
                "exception_type": status,
                "expected_amount": expected_amt,
                "actual_amount": settled_amt if settled_amt is not None else paid_amt,
                "difference": diff,
                "severity": severity,
                "resolution_status": resolution_status,
                "explanation": explanation,
                "recommended_action": recommended_action,
                "ai_investigation": None
            }
            
            exceptions.append(exc_record)
            # Link back into result object
            r["exception"] = exc_record
            
        return exceptions

    @staticmethod
    def _calculate_severity(status: str, diff: float, expected_amt: float) -> str:
        if status in ["DUPLICATE", "UNRESOLVED"] or diff >= 2500.0:
            return "CRITICAL"
        if status in ["MISSING_PAYMENT", "MISSING_SETTLEMENT"] or diff >= 500.0:
            return "HIGH"
        if status in ["AMOUNT_MISMATCH", "DATE_MISMATCH"] or diff > 50.0:
            return "MEDIUM"
        if status == "MATCHED_WITH_TOLERANCE":
            return "LOW"
        return "MEDIUM"

    @staticmethod
    def _generate_deterministic_analysis(
        status: str,
        diff: float,
        expected_amt: float,
        paid_amt: Optional[float],
        settled_amt: Optional[float],
        order_id: Optional[str],
        txn_id: Optional[str],
        stl_id: Optional[str],
        payment_status: Optional[str],
        settlement_status: Optional[str]
    ) -> tuple[str, str]:
        
        if status == "MATCHED_WITH_TOLERANCE":
            exp = f"Settled amount ₹{settled_amt:,.2f} differs by ₹{diff:,.2f} from expected ₹{expected_amt:,.2f}, which is within the configured system tolerance."
            act = "Auto-accepted variance within tolerance threshold. No manual intervention required."
            return exp, act

        if status == "AMOUNT_MISMATCH":
            if paid_amt == expected_amt and settled_amt is not None:
                exp = f"Payment captured in full (₹{paid_amt:,.2f}), but settlement amount is ₹{settled_amt:,.2f}, resulting in a ₹{diff:,.2f} shortfall at bank settlement."
                act = "Cross-check merchant discount rate (MDR) deductions, chargeback reserves, or banking partner fee schedules before manual ledger adjustment."
            else:
                exp = f"Discrepancy of ₹{diff:,.2f} identified between expected order amount (₹{expected_amt:,.2f}) and received settlement (₹{settled_amt:,.2f})."
                act = "Review transaction capture log and partner invoice to reconcile difference."
            return exp, act

        if status == "MISSING_PAYMENT":
            exp = f"Order {order_id} recorded in internal ledger (expected ₹{expected_amt:,.2f}) has no associated payment transaction in gateway feed."
            act = "Check gateway webhook logs for dropped payloads or abandoned cart status. Inquire with customer if order should be voided."
            return exp, act

        if status == "MISSING_SETTLEMENT":
            exp = f"Payment {txn_id} (₹{paid_amt:,.2f}) was successfully captured, but no settlement record exists in bank reconciliation feed."
            act = "Verify bank nodal account statement and escalate missing batch item to banking operations partner."
            return exp, act

        if status == "DUPLICATE":
            exp = f"Transaction reference {txn_id} appears multiple times across payment/settlement records."
            act = "Flagged for dual-debit audit. Review refund status to prevent double fulfillment or merchant duplicate loss."
            return exp, act

        if status == "DATE_MISMATCH":
            exp = f"Settlement timestamp for {txn_id} indicates an abnormal lifecycle window or timing discrepancy."
            act = "Audit timezone synchronization and confirm settlement SLA window with acquiring bank."
            return exp, act

        if status == "UNRESOLVED":
            exp = f"Multi-point conflict detected: status inconsistency ({payment_status}/{settlement_status}) combined with financial discrepancy of ₹{diff:,.2f}."
            act = "Assign high-priority human review. Freeze automatic ledger closing for this record until ops audit is complete."
            return exp, act

        return (
            f"Discrepancy detected for order {order_id} with difference of ₹{diff:,.2f}.",
            "Perform manual review of transaction lifecycle logs."
        )
