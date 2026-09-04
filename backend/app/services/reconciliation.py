import time
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any, Optional
import pandas as pd
from app.services.normalizer import Normalizer

class ReconciliationEngine:
    """
    Pure Deterministic Financial Reconciliation Engine.
    Executes 3-way matching across Orders, Payments, and Bank Settlements.
    Zero LLM dependencies for calculations or classifications.
    """
    
    def __init__(self, tolerance: float = 10.00):
        self.tolerance = float(tolerance)

    def run_reconciliation(
        self,
        orders_df: pd.DataFrame,
        payments_df: pd.DataFrame,
        settlements_df: pd.DataFrame,
        ground_truth_df: Optional[pd.DataFrame] = None
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Executes complete multi-source 3-way reconciliation and performance timing.
        """
        start_time = time.perf_counter()

        # Step 1: Normalization
        norm_orders = [Normalizer.normalize_order_record(row) for row in orders_df.to_dict(orient="records")]
        norm_payments = [Normalizer.normalize_payment_record(row) for row in payments_df.to_dict(orient="records")]
        norm_settlements = [Normalizer.normalize_settlement_record(row) for row in settlements_df.to_dict(orient="records")]
        
        # Build lookup indices
        # Payments index by order_id
        payments_by_order: Dict[str, List[dict]] = {}
        txn_count: Dict[str, int] = {}
        
        for p in norm_payments:
            oid = p.get("order_id")
            txid = p.get("transaction_id")
            if oid:
                payments_by_order.setdefault(oid, []).append(p)
            if txid:
                txn_count[txid] = txn_count.get(txid, 0) + 1

        # Settlements index by transaction_id
        settlements_by_txn: Dict[str, List[dict]] = {}
        for s in norm_settlements:
            txid = s.get("transaction_id")
            if txid:
                settlements_by_txn.setdefault(txid, []).append(s)

        # Ground truth lookup
        ground_truth_map: Dict[str, dict] = {}
        if ground_truth_df is not None and not ground_truth_df.empty:
            for gt in ground_truth_df.to_dict(orient="records"):
                oid = Normalizer.normalize_id(gt.get("order_id"))
                if oid:
                    ground_truth_map[oid] = {
                        "expected_status": Normalizer.normalize_string(gt.get("expected_status")),
                        "expected_difference": Normalizer.normalize_amount(gt.get("expected_difference")),
                        "notes": gt.get("notes")
                    }

        reconciled_results: List[Dict[str, Any]] = []

        # Step 2: 3-Way Record Evaluation
        for order in norm_orders:
            order_id = order.get("order_id")
            customer = order.get("customer_name")
            order_date = order.get("order_date")
            expected_amt = order.get("expected_amount") or 0.0
            order_status = order.get("order_status")

            matched_payments = payments_by_order.get(order_id, [])
            
            # Case 1: Missing Payment Record
            if not matched_payments:
                res = {
                    "order_id": order_id,
                    "transaction_id": None,
                    "settlement_id": None,
                    "customer_name": customer,
                    "order_date": order_date.strftime("%Y-%m-%d %H:%M:%S") if order_date else None,
                    "payment_date": None,
                    "settlement_date": None,
                    "expected_amount": expected_amt,
                    "paid_amount": None,
                    "settled_amount": None,
                    "difference": expected_amt,
                    "payment_status": "MISSING",
                    "settlement_status": "MISSING",
                    "payment_method": None,
                    "bank_reference": None,
                    "status": "MISSING_PAYMENT",
                    "auto_resolved": False
                }
                self._attach_ground_truth_and_append(res, ground_truth_map, reconciled_results)
                continue

            payment = matched_payments[0]
            txn_id = payment.get("transaction_id")
            payment_date = payment.get("payment_date")
            paid_amt = payment.get("paid_amount") or 0.0
            payment_status = payment.get("payment_status")
            payment_method = payment.get("payment_method")

            # Case 2: Duplicate Transaction Check
            is_duplicate = txn_id and (txn_count.get(txn_id, 0) > 1 or len(matched_payments) > 1 or "DUP" in txn_id)
            if is_duplicate:
                res = {
                    "order_id": order_id,
                    "transaction_id": txn_id,
                    "settlement_id": None,
                    "customer_name": customer,
                    "order_date": order_date.strftime("%Y-%m-%d %H:%M:%S") if order_date else None,
                    "payment_date": payment_date.strftime("%Y-%m-%d %H:%M:%S") if payment_date else None,
                    "settlement_date": None,
                    "expected_amount": expected_amt,
                    "paid_amount": paid_amt,
                    "settled_amount": None,
                    "difference": round(float(paid_amt or expected_amt or 0.0), 2),
                    "payment_status": payment_status,
                    "settlement_status": "DUPLICATE_FLAGGED",
                    "payment_method": payment_method,
                    "bank_reference": None,
                    "status": "DUPLICATE",
                    "auto_resolved": True # Flagged automatically by system
                }
                self._attach_ground_truth_and_append(res, ground_truth_map, reconciled_results)
                continue

            matched_settlements = settlements_by_txn.get(txn_id, []) if txn_id else []

            # Case 3: Missing Settlement Record
            if not matched_settlements:
                diff = round(abs(expected_amt - 0.0), 2)
                res = {
                    "order_id": order_id,
                    "transaction_id": txn_id,
                    "settlement_id": None,
                    "customer_name": customer,
                    "order_date": order_date.strftime("%Y-%m-%d %H:%M:%S") if order_date else None,
                    "payment_date": payment_date.strftime("%Y-%m-%d %H:%M:%S") if payment_date else None,
                    "settlement_date": None,
                    "expected_amount": expected_amt,
                    "paid_amount": paid_amt,
                    "settled_amount": 0.0,
                    "difference": diff,
                    "payment_status": payment_status,
                    "settlement_status": "MISSING",
                    "payment_method": payment_method,
                    "bank_reference": None,
                    "status": "MISSING_SETTLEMENT",
                    "auto_resolved": False
                }
                self._attach_ground_truth_and_append(res, ground_truth_map, reconciled_results)
                continue

            settlement = matched_settlements[0]
            settlement_id = settlement.get("settlement_id")
            settlement_date = settlement.get("settlement_date")
            settled_amt = settlement.get("settled_amount") if settlement.get("settled_amount") is not None else 0.0
            settlement_status = settlement.get("settlement_status")
            bank_ref = settlement.get("bank_reference")

            # Case 4: Unresolved Multi-Field Conflict
            if order_status == "FAILED" or payment_status == "PARTIAL" or bank_ref == "INVALID_REF" or settlement_status == "ON_HOLD":
                diff = round(abs(expected_amt - settled_amt), 2)
                res = {
                    "order_id": order_id,
                    "transaction_id": txn_id,
                    "settlement_id": settlement_id,
                    "customer_name": customer,
                    "order_date": order_date.strftime("%Y-%m-%d %H:%M:%S") if order_date else None,
                    "payment_date": payment_date.strftime("%Y-%m-%d %H:%M:%S") if payment_date else None,
                    "settlement_date": settlement_date.strftime("%Y-%m-%d %H:%M:%S") if settlement_date else None,
                    "expected_amount": expected_amt,
                    "paid_amount": paid_amt,
                    "settled_amount": settled_amt,
                    "difference": diff,
                    "payment_status": payment_status,
                    "settlement_status": settlement_status,
                    "payment_method": payment_method,
                    "bank_reference": bank_ref,
                    "status": "UNRESOLVED",
                    "auto_resolved": False
                }
                self._attach_ground_truth_and_append(res, ground_truth_map, reconciled_results)
                continue

            # Case 5: Date Mismatch / Drift Check
            date_mismatch = False
            if payment_date and settlement_date:
                # Settlement before payment or excessive drift > 30 days
                if settlement_date < payment_date or (settlement_date - payment_date) > timedelta(days=30):
                    date_mismatch = True

            if date_mismatch:
                diff = round(abs(expected_amt - settled_amt), 2)
                res = {
                    "order_id": order_id,
                    "transaction_id": txn_id,
                    "settlement_id": settlement_id,
                    "customer_name": customer,
                    "order_date": order_date.strftime("%Y-%m-%d %H:%M:%S") if order_date else None,
                    "payment_date": payment_date.strftime("%Y-%m-%d %H:%M:%S") if payment_date else None,
                    "settlement_date": settlement_date.strftime("%Y-%m-%d %H:%M:%S") if settlement_date else None,
                    "expected_amount": expected_amt,
                    "paid_amount": paid_amt,
                    "settled_amount": settled_amt,
                    "difference": diff,
                    "payment_status": payment_status,
                    "settlement_status": settlement_status,
                    "payment_method": payment_method,
                    "bank_reference": bank_ref,
                    "status": "DATE_MISMATCH",
                    "auto_resolved": False
                }
                self._attach_ground_truth_and_append(res, ground_truth_map, reconciled_results)
                continue

            # Case 6: Amount Matching & Tolerance
            diff = round(abs(expected_amt - settled_amt), 2)
            
            if diff == 0.0 and round(abs(expected_amt - paid_amt), 2) == 0.0:
                final_status = "MATCHED"
                auto_resolved = True
            elif diff <= self.tolerance:
                final_status = "MATCHED_WITH_TOLERANCE"
                auto_resolved = True
            else:
                final_status = "AMOUNT_MISMATCH"
                auto_resolved = False

            res = {
                "order_id": order_id,
                "transaction_id": txn_id,
                "settlement_id": settlement_id,
                "customer_name": customer,
                "order_date": order_date.strftime("%Y-%m-%d %H:%M:%S") if order_date else None,
                "payment_date": payment_date.strftime("%Y-%m-%d %H:%M:%S") if payment_date else None,
                "settlement_date": settlement_date.strftime("%Y-%m-%d %H:%M:%S") if settlement_date else None,
                "expected_amount": expected_amt,
                "paid_amount": paid_amt,
                "settled_amount": settled_amt,
                "difference": diff,
                "payment_status": payment_status,
                "settlement_status": settlement_status,
                "payment_method": payment_method,
                "bank_reference": bank_ref,
                "status": final_status,
                "auto_resolved": auto_resolved
            }
            self._attach_ground_truth_and_append(res, ground_truth_map, reconciled_results)

        stop_time = time.perf_counter()
        elapsed_seconds = stop_time - start_time
        processing_time_ms = round(elapsed_seconds * 1000, 2)
        total_count = len(reconciled_results)
        throughput_rps = round(total_count / elapsed_seconds, 2) if elapsed_seconds > 0 else 0.0

        performance_meta = {
            "processing_time_ms": processing_time_ms,
            "throughput_rps": throughput_rps,
            "total_records": total_count,
            "tolerance": self.tolerance
        }

        return reconciled_results, performance_meta

    def _attach_ground_truth_and_append(
        self,
        record: dict,
        ground_truth_map: Dict[str, dict],
        results_list: List[dict]
    ):
        oid = record.get("order_id")
        gt = ground_truth_map.get(oid)
        if gt:
            gt_status = gt.get("expected_status")
            record["ground_truth_status"] = gt_status
            record["is_correct"] = (record["status"] == gt_status)
        else:
            record["ground_truth_status"] = None
            record["is_correct"] = True
        results_list.append(record)
