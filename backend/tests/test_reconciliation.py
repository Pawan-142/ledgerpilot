import pytest
import pandas as pd
from datetime import datetime, timedelta
from app.services.reconciliation import ReconciliationEngine
from app.services.normalizer import Normalizer
from app.services.metrics import MetricsCalculator

def test_normalization_layer():
    # String & ID cleaning
    assert Normalizer.normalize_id("  txn-1042 ") == "TXN-1042"
    assert Normalizer.normalize_id("ord 2005") == "ORD2005"
    
    # Currency parsing
    assert Normalizer.normalize_amount("₹5,000.50") == 5000.50
    assert Normalizer.normalize_amount("$ 12,499.00 ") == 12499.00
    assert Normalizer.normalize_amount(4500) == 4500.00
    
    # Date parsing
    d = Normalizer.normalize_date("2026-09-01 10:30:00")
    assert isinstance(d, datetime)
    assert d.year == 2026

def test_reconciliation_exact_match():
    orders = pd.DataFrame([{
        "order_id": "ORD-101",
        "customer_name": "Aarav Sharma",
        "order_date": "2026-09-01 10:00:00",
        "expected_amount": "5000.00",
        "currency": "INR",
        "order_status": "COMPLETED"
    }])
    payments = pd.DataFrame([{
        "transaction_id": "TXN-201",
        "order_id": "ORD-101",
        "payment_date": "2026-09-01 10:05:00",
        "paid_amount": 5000.00,
        "payment_status": "SUCCESS",
        "payment_method": "UPI"
    }])
    settlements = pd.DataFrame([{
        "settlement_id": "STL-301",
        "transaction_id": "TXN-201",
        "settlement_date": "2026-09-02 12:00:00",
        "settled_amount": 5000.00,
        "settlement_status": "SETTLED",
        "bank_reference": "HDFC12345678"
    }])
    
    engine = ReconciliationEngine(tolerance=10.0)
    results, perf = engine.run_reconciliation(orders, payments, settlements)
    
    assert len(results) == 1
    assert results[0]["status"] == "MATCHED"
    assert results[0]["difference"] == 0.0
    assert results[0]["auto_resolved"] is True

def test_reconciliation_tolerance_match():
    orders = pd.DataFrame([{
        "order_id": "ORD-102",
        "customer_name": "Priya Patel",
        "order_date": "2026-09-01 10:00:00",
        "expected_amount": 5000.00,
        "currency": "INR",
        "order_status": "COMPLETED"
    }])
    payments = pd.DataFrame([{
        "transaction_id": "TXN-202",
        "order_id": "ORD-102",
        "payment_date": "2026-09-01 10:05:00",
        "paid_amount": 5000.00,
        "payment_status": "SUCCESS",
        "payment_method": "UPI"
    }])
    settlements = pd.DataFrame([{
        "settlement_id": "STL-302",
        "transaction_id": "TXN-202",
        "settlement_date": "2026-09-02 12:00:00",
        "settled_amount": 4995.00, # ₹5 difference within ₹10 tolerance
        "settlement_status": "SETTLED",
        "bank_reference": "HDFC12345679"
    }])
    
    engine = ReconciliationEngine(tolerance=10.0)
    results, perf = engine.run_reconciliation(orders, payments, settlements)
    
    assert len(results) == 1
    assert results[0]["status"] == "MATCHED_WITH_TOLERANCE"
    assert results[0]["difference"] == 5.0
    assert results[0]["auto_resolved"] is True

def test_reconciliation_amount_mismatch():
    orders = pd.DataFrame([{
        "order_id": "ORD-103",
        "customer_name": "Rohan Verma",
        "order_date": "2026-09-01 10:00:00",
        "expected_amount": 5000.00,
        "currency": "INR",
        "order_status": "COMPLETED"
    }])
    payments = pd.DataFrame([{
        "transaction_id": "TXN-203",
        "order_id": "ORD-103",
        "payment_date": "2026-09-01 10:05:00",
        "paid_amount": 5000.00,
        "payment_status": "SUCCESS",
        "payment_method": "CREDIT_CARD"
    }])
    settlements = pd.DataFrame([{
        "settlement_id": "STL-303",
        "transaction_id": "TXN-203",
        "settlement_date": "2026-09-02 12:00:00",
        "settled_amount": 4500.00, # ₹500 difference > ₹10 tolerance
        "settlement_status": "SETTLED",
        "bank_reference": "HDFC12345680"
    }])
    
    engine = ReconciliationEngine(tolerance=10.0)
    results, perf = engine.run_reconciliation(orders, payments, settlements)
    
    assert len(results) == 1
    assert results[0]["status"] == "AMOUNT_MISMATCH"
    assert results[0]["difference"] == 500.0
    assert results[0]["auto_resolved"] is False

def test_reconciliation_missing_payment():
    orders = pd.DataFrame([{
        "order_id": "ORD-104",
        "customer_name": "Ananya Iyer",
        "order_date": "2026-09-01 10:00:00",
        "expected_amount": 2499.00,
        "currency": "INR",
        "order_status": "COMPLETED"
    }])
    payments = pd.DataFrame([]) # Empty
    settlements = pd.DataFrame([])
    
    engine = ReconciliationEngine(tolerance=10.0)
    results, perf = engine.run_reconciliation(orders, payments, settlements)
    
    assert len(results) == 1
    assert results[0]["status"] == "MISSING_PAYMENT"
    assert results[0]["auto_resolved"] is False

def test_reconciliation_missing_settlement():
    orders = pd.DataFrame([{
        "order_id": "ORD-105",
        "customer_name": "Vikram Malhotra",
        "order_date": "2026-09-01 10:00:00",
        "expected_amount": 3200.00,
        "currency": "INR",
        "order_status": "COMPLETED"
    }])
    payments = pd.DataFrame([{
        "transaction_id": "TXN-205",
        "order_id": "ORD-105",
        "payment_date": "2026-09-01 10:05:00",
        "paid_amount": 3200.00,
        "payment_status": "SUCCESS",
        "payment_method": "UPI"
    }])
    settlements = pd.DataFrame([]) # Missing settlement
    
    engine = ReconciliationEngine(tolerance=10.0)
    results, perf = engine.run_reconciliation(orders, payments, settlements)
    
    assert len(results) == 1
    assert results[0]["status"] == "MISSING_SETTLEMENT"
    assert results[0]["auto_resolved"] is False

def test_reconciliation_duplicate_detection():
    orders = pd.DataFrame([
        {
            "order_id": "ORD-106A",
            "customer_name": "Sneha Nair",
            "order_date": "2026-09-01 10:00:00",
            "expected_amount": 1250.00,
            "currency": "INR",
            "order_status": "COMPLETED"
        },
        {
            "order_id": "ORD-106B",
            "customer_name": "Sneha Nair",
            "order_date": "2026-09-01 10:02:00",
            "expected_amount": 1250.00,
            "currency": "INR",
            "order_status": "COMPLETED"
        }
    ])
    payments = pd.DataFrame([
        {
            "transaction_id": "TXN-DUP-01",
            "order_id": "ORD-106A",
            "payment_date": "2026-09-01 10:05:00",
            "paid_amount": 1250.00,
            "payment_status": "SUCCESS",
            "payment_method": "UPI"
        },
        {
            "transaction_id": "TXN-DUP-01", # Duplicate
            "order_id": "ORD-106B",
            "payment_date": "2026-09-01 10:06:00",
            "paid_amount": 1250.00,
            "payment_status": "SUCCESS",
            "payment_method": "UPI"
        }
    ])
    settlements = pd.DataFrame([])
    
    engine = ReconciliationEngine(tolerance=10.0)
    results, perf = engine.run_reconciliation(orders, payments, settlements)
    
    assert len(results) == 2
    assert results[0]["status"] == "DUPLICATE"
    assert results[1]["status"] == "DUPLICATE"

def test_reconciliation_date_mismatch():
    orders = pd.DataFrame([{
        "order_id": "ORD-107",
        "customer_name": "Aditya Joshi",
        "order_date": "2026-09-10 10:00:00",
        "expected_amount": 5000.00,
        "currency": "INR",
        "order_status": "COMPLETED"
    }])
    payments = pd.DataFrame([{
        "transaction_id": "TXN-207",
        "order_id": "ORD-107",
        "payment_date": "2026-09-10 10:05:00",
        "paid_amount": 5000.00,
        "payment_status": "SUCCESS",
        "payment_method": "UPI"
    }])
    settlements = pd.DataFrame([{
        "settlement_id": "STL-307",
        "transaction_id": "TXN-207",
        "settlement_date": "2026-09-08 12:00:00", # Date precedes payment!
        "settled_amount": 5000.00,
        "settlement_status": "SETTLED",
        "bank_reference": "HDFC99887766"
    }])
    
    engine = ReconciliationEngine(tolerance=10.0)
    results, perf = engine.run_reconciliation(orders, payments, settlements)
    
    assert len(results) == 1
    assert results[0]["status"] == "DATE_MISMATCH"

def test_metrics_calculation_and_ground_truth():
    results = [
        {"status": "MATCHED", "ground_truth_status": "MATCHED", "auto_resolved": True, "difference": 0.0},
        {"status": "MATCHED", "ground_truth_status": "MATCHED", "auto_resolved": True, "difference": 0.0},
        {"status": "MATCHED_WITH_TOLERANCE", "ground_truth_status": "MATCHED_WITH_TOLERANCE", "auto_resolved": True, "difference": 5.0},
        {"status": "AMOUNT_MISMATCH", "ground_truth_status": "AMOUNT_MISMATCH", "auto_resolved": False, "difference": 500.0}
    ]
    perf = {"processing_time_ms": 12.5, "throughput_rps": 320.0, "tolerance": 10.0}
    
    metrics = MetricsCalculator.calculate_all_metrics(results, perf)
    
    assert metrics["total_records"] == 4
    assert metrics["matched_records"] == 2
    assert metrics["tolerance_matches"] == 1
    assert metrics["amount_mismatches"] == 1
    assert metrics["match_rate"] == 75.0 # (2+1)/4 * 100
    assert metrics["accuracy"] == 100.0
    assert metrics["exception_recall"] == 100.0
    assert metrics["throughput_rps"] == 320.0
