import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_resolve_exception_endpoint():
    # First trigger reconcile to seed DB
    recon_res = client.post("/api/reconcile", json={"tolerance": 10.0})
    assert recon_res.status_code == 200
    
    # Get top exceptions
    exc_res = client.get("/api/exceptions?limit=5")
    assert exc_res.status_code == 200
    exceptions = exc_res.json()
    assert len(exceptions) > 0
    
    target_id = exceptions[0]["id"]
    resolve_res = client.post(
        f"/api/exceptions/{target_id}/resolve",
        json={
            "action": "FEE_ADJUSTMENT",
            "note": "Verified Razorpay 2% MDR deduction",
            "operator_name": "Senior FinOps Controller"
        }
    )
    assert resolve_res.status_code == 200
    data = resolve_res.json()
    assert data["resolution_status"] == "RESOLVED"
    assert "FEE_ADJUSTMENT" in data["recommended_action"] or "Fee Adjustment" in data["recommended_action"]

def test_draft_dispute_endpoint():
    recon_res = client.post("/api/reconcile", json={"tolerance": 10.0})
    assert recon_res.status_code == 200

    exc_res = client.get("/api/exceptions?limit=1")
    assert exc_res.status_code == 200
    exceptions = exc_res.json()
    assert len(exceptions) > 0

    target_txn = exceptions[0]["transaction_id"] or exceptions[0]["order_id"]
    dispute_res = client.post(
        "/api/ai/draft-dispute",
        json={
            "transaction_id": target_txn,
            "recipient_type": "bank",
            "custom_instructions": "Flag for priority audit"
        }
    )
    assert dispute_res.status_code == 200
    data = dispute_res.json()
    assert "subject" in data
    assert "body" in data
    assert data["recipient_type"] == "bank"

def test_custom_csv_upload_endpoint():
    orders_csv = b"order_id,customer_name,order_date,expected_amount,currency,order_status\nORD-1,Aarav,2026-09-01 10:00:00,5000.00,INR,COMPLETED\nORD-2,Priya,2026-09-01 10:15:00,2000.00,INR,COMPLETED"
    payments_csv = b"transaction_id,order_id,payment_date,paid_amount,payment_status,payment_method\nTXN-1,ORD-1,2026-09-01 10:05:00,5000.00,SUCCESS,UPI\nTXN-2,ORD-2,2026-09-01 10:18:00,2000.00,SUCCESS,CARD"
    settlements_csv = b"settlement_id,transaction_id,settlement_date,settled_amount,settlement_status,bank_reference\nSTL-1,TXN-1,2026-09-02 12:00:00,5000.00,SETTLED,HDFC1\nSTL-2,TXN-2,2026-09-02 12:00:00,1995.00,SETTLED,HDFC2"

    files = {
        "orders_file": ("orders.csv", io.BytesIO(orders_csv), "text/csv"),
        "payments_file": ("payments.csv", io.BytesIO(payments_csv), "text/csv"),
        "settlements_file": ("settlements.csv", io.BytesIO(settlements_csv), "text/csv"),
    }
    data = {"tolerance": "10.0"}

    res = client.post("/api/reconcile/upload", files=files, data=data)
    assert res.status_code == 200
    payload = res.json()
    assert payload["total_records"] == 2
    assert payload["matched_records"] >= 1

def test_bulk_resolve_endpoint():
    recon_res = client.post("/api/reconcile", json={"tolerance": 10.0})
    assert recon_res.status_code == 200

    bulk_res = client.post(
        "/api/exceptions/bulk-resolve",
        json={
            "action": "FEE_ADJUSTMENT",
            "exception_type": "AMOUNT_MISMATCH",
            "operator_name": "Batch FinOps Worker",
            "note": "Auto-resolved via test batch"
        }
    )
    assert bulk_res.status_code == 200
    data = bulk_res.json()
    assert "resolved_count" in data
    assert data["resolved_count"] >= 0
    assert "remaining_unresolved" in data
