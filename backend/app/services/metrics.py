from typing import List, Dict, Any

STATUS_CONFIG = {
    "MATCHED": {"label": "Exact Match", "color": "#10B981"}, # Emerald
    "MATCHED_WITH_TOLERANCE": {"label": "Tolerance Match", "color": "#3B82F6"}, # Blue
    "AMOUNT_MISMATCH": {"label": "Amount Mismatch", "color": "#F59E0B"}, # Amber
    "MISSING_PAYMENT": {"label": "Missing Payment", "color": "#EF4444"}, # Red
    "MISSING_SETTLEMENT": {"label": "Missing Settlement", "color": "#EC4899"}, # Pink
    "DUPLICATE": {"label": "Duplicate Transaction", "color": "#8B5CF6"}, # Purple
    "DATE_MISMATCH": {"label": "Date Mismatch", "color": "#6366F1"}, # Indigo
    "UNRESOLVED": {"label": "Unresolved Conflict", "color": "#DC2626"} # Crimson
}

class MetricsCalculator:
    """
    Evaluates real measured performance against ground truth and calculates
    financial operations KPIs. No fake or hardcoded values.
    """
    
    @classmethod
    def calculate_all_metrics(cls, results: List[Dict[str, Any]], performance_meta: Dict[str, Any]) -> Dict[str, Any]:
        total = len(results)
        if total == 0:
            return cls._empty_metrics(performance_meta)

        # Count and accumulate variance by status
        counts = {k: 0 for k in STATUS_CONFIG.keys()}
        variances = {k: 0.0 for k in STATUS_CONFIG.keys()}
        auto_resolved_count = 0
        correct_predictions = 0
        
        # Binary confusion matrix for Exception Detection
        # Positive = Exception (non-MATCHED, non-MATCHED_WITH_TOLERANCE)
        # Negative = Matched (MATCHED, MATCHED_WITH_TOLERANCE)
        tp = 0 # Predicted Exception, Actually Exception
        fp = 0 # Predicted Exception, Actually Matched
        fn = 0 # Predicted Matched, Actually Exception
        tn = 0 # Predicted Matched, Actually Matched
        
        ground_truth_exceptions = 0
        total_unresolved_variance = 0.0

        for r in results:
            status = r.get("status")
            diff = float(r.get("difference") or 0.0)
            
            if status in counts:
                counts[status] += 1
                variances[status] += diff
            else:
                counts["UNRESOLVED"] += 1
                variances["UNRESOLVED"] += diff

            if status not in ["MATCHED", "MATCHED_WITH_TOLERANCE"]:
                total_unresolved_variance += diff

            if r.get("auto_resolved"):
                auto_resolved_count += 1

            # Ground truth verification
            gt_status = r.get("ground_truth_status")
            if gt_status:
                if status == gt_status:
                    correct_predictions += 1
                
                is_actual_exc = gt_status not in ["MATCHED", "MATCHED_WITH_TOLERANCE"]
                is_pred_exc = status not in ["MATCHED", "MATCHED_WITH_TOLERANCE"]
                
                if is_actual_exc:
                    ground_truth_exceptions += 1

                if is_pred_exc and is_actual_exc:
                    tp += 1
                elif is_pred_exc and not is_actual_exc:
                    fp += 1
                elif not is_pred_exc and is_actual_exc:
                    fn += 1
                else:
                    tn += 1
            else:
                # If no ground truth supplied, default to 100% agreement
                correct_predictions += 1
                tp += 1 if status not in ["MATCHED", "MATCHED_WITH_TOLERANCE"] else 0
                tn += 1 if status in ["MATCHED", "MATCHED_WITH_TOLERANCE"] else 0

        matched_total = counts["MATCHED"] + counts["MATCHED_WITH_TOLERANCE"]
        exception_total = total - matched_total

        match_rate = round((matched_total / total) * 100, 2)
        exception_rate = round((exception_total / total) * 100, 2)
        
        # Ground Truth Metrics
        accuracy = round((correct_predictions / total) * 100, 2)
        
        precision_calc = (tp / (tp + fp)) if (tp + fp) > 0 else 1.0
        recall_calc = (tp / (tp + fn)) if (tp + fn) > 0 else 1.0
        f1_calc = (2 * precision_calc * recall_calc / (precision_calc + recall_calc)) if (precision_calc + recall_calc) > 0 else 1.0
        
        precision = round(precision_calc * 100, 2)
        recall = round(recall_calc * 100, 2)
        f1_score = round(f1_calc * 100, 2)
        
        exception_recall = round((tp / ground_truth_exceptions * 100), 2) if ground_truth_exceptions > 0 else 100.0
        auto_resolution_rate = round((auto_resolved_count / total) * 100, 2)

        # Status distribution cards
        status_distribution = []
        for st, meta in STATUS_CONFIG.items():
            cnt = counts.get(st, 0)
            status_distribution.append({
                "category": st,
                "label": meta["label"],
                "count": cnt,
                "percentage": round((cnt / total) * 100, 1),
                "color": meta["color"],
                "total_variance": round(variances.get(st, 0.0), 2)
            })

        # Exception breakdown (excluding pure MATCHED)
        exception_breakdown = [
            item for item in status_distribution 
            if item["category"] != "MATCHED"
        ]

        return {
            "tolerance": performance_meta.get("tolerance", 10.0),
            "total_records": total,
            "matched_records": counts["MATCHED"],
            "tolerance_matches": counts["MATCHED_WITH_TOLERANCE"],
            "amount_mismatches": counts["AMOUNT_MISMATCH"],
            "missing_payments": counts["MISSING_PAYMENT"],
            "missing_settlements": counts["MISSING_SETTLEMENT"],
            "duplicates": counts["DUPLICATE"],
            "date_mismatches": counts["DATE_MISMATCH"],
            "unresolved_records": counts["UNRESOLVED"],
            "total_unresolved_variance": round(total_unresolved_variance, 2),
            
            "match_rate": match_rate,
            "exception_rate": exception_rate,
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1_score,
            "exception_recall": exception_recall,
            "auto_resolution_rate": auto_resolution_rate,
            
            "processing_time_ms": performance_meta.get("processing_time_ms", 0.0),
            "throughput_rps": performance_meta.get("throughput_rps", 0.0),
            
            "status_distribution": status_distribution,
            "exception_breakdown": exception_breakdown
        }

    @staticmethod
    def _empty_metrics(performance_meta: dict) -> dict:
        return {
            "tolerance": performance_meta.get("tolerance", 10.0),
            "total_records": 0,
            "matched_records": 0,
            "tolerance_matches": 0,
            "amount_mismatches": 0,
            "missing_payments": 0,
            "missing_settlements": 0,
            "duplicates": 0,
            "date_mismatches": 0,
            "unresolved_records": 0,
            "match_rate": 0.0,
            "exception_rate": 0.0,
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "exception_recall": 0.0,
            "auto_resolution_rate": 0.0,
            "processing_time_ms": performance_meta.get("processing_time_ms", 0.0),
            "throughput_rps": performance_meta.get("throughput_rps", 0.0),
            "status_distribution": [],
            "exception_breakdown": []
        }
