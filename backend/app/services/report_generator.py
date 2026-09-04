from datetime import datetime, timezone
from typing import Dict, Any, List
import pandas as pd
from io import StringIO

class ReportGenerator:
    """
    Generates executive financial audit reports, markdown briefs, and exportable datasets.
    """
    
    @staticmethod
    def generate_executive_report(
        run_id: str,
        metrics: Dict[str, Any],
        results: List[Dict[str, Any]],
        exceptions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        
        # Identify high value unresolved / exceptions
        unresolved_or_high_value = [
            r for r in results 
            if r.get("status") not in ["MATCHED", "MATCHED_WITH_TOLERANCE"]
        ]
        unresolved_or_high_value.sort(key=lambda x: x.get("difference", 0.0), reverse=True)
        top_unresolved = unresolved_or_high_value[:10]
        
        total = metrics.get("total_records", 0)
        match_rate = metrics.get("match_rate", 0.0)
        accuracy = metrics.get("accuracy", 0.0)
        exc_recall = metrics.get("exception_recall", 0.0)
        throughput = metrics.get("throughput_rps", 0.0)
        proc_time = metrics.get("processing_time_ms", 0.0)
        
        summary_text = (
            f"LedgerPilot reconciled a multi-source financial batch of {total} records across "
            f"Orders, Payments, and Bank Settlements in {proc_time}ms ({throughput} records/sec). "
            f"The deterministic controller achieved an overall match rate of {match_rate}% "
            f"({metrics.get('matched_records', 0)} exact matches, {metrics.get('tolerance_matches', 0)} within ₹{metrics.get('tolerance', 10.0)} tolerance). "
            f"Against ground-truth benchmarks, the engine attained {accuracy}% classification accuracy and {exc_recall}% exception detection recall. "
            f"A total of {len(exceptions)} exceptions were flagged, with {metrics.get('auto_resolution_rate', 0.0)}% automated resolution coverage."
        )
        
        recommendations = [
            f"Prioritize audit of {len(top_unresolved)} high-value variance records representing top ledger risk.",
            f"Verify {metrics.get('missing_settlements', 0)} missing settlement records with banking operations partner.",
            f"Audit webhook retry mechanism for {metrics.get('missing_payments', 0)} orders with unlinked payments.",
            f"Review dual-debit refund statuses for {metrics.get('duplicates', 0)} duplicate transaction occurrences.",
            f"Confirm settlement SLA compliance on {metrics.get('date_mismatches', 0)} date discrepancy records."
        ]
        
        return {
            "report_id": f"REP-{run_id[-6:]}",
            "batch_id": run_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "metrics": metrics,
            "high_value_unresolved": top_unresolved,
            "top_exception_categories": metrics.get("exception_breakdown", []),
            "executive_summary": summary_text,
            "actionable_recommendations": recommendations
        }

    @staticmethod
    def export_results_to_csv(results: List[Dict[str, Any]]) -> str:
        clean_rows = []
        for r in results:
            clean_rows.append({
                "Order ID": r.get("order_id"),
                "Transaction ID": r.get("transaction_id"),
                "Settlement ID": r.get("settlement_id"),
                "Customer": r.get("customer_name"),
                "Order Date": r.get("order_date"),
                "Expected (INR)": r.get("expected_amount"),
                "Paid (INR)": r.get("paid_amount"),
                "Settled (INR)": r.get("settled_amount"),
                "Difference (INR)": r.get("difference"),
                "Reconciliation Status": r.get("status"),
                "Ground Truth Status": r.get("ground_truth_status"),
                "Classification Correct": r.get("is_correct"),
                "Auto Resolved": r.get("auto_resolved")
            })
        df = pd.DataFrame(clean_rows)
        return df.to_csv(index=False)
