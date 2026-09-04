import os
import random
from datetime import datetime, timedelta
import pandas as pd
from pathlib import Path
from app.config import settings

INDIAN_NAMES = [
    "Aarav Sharma", "Priya Patel", "Rohan Verma", "Ananya Iyer", "Vikram Malhotra",
    "Sneha Nair", "Aditya Joshi", "Kavita Rao", "Deepak Gupta", "Meera Sundaram",
    "Arjun Kapoor", "Pooja Hegde", "Rahul Dravid", "Sunita Deshmukh", "Karan Singhal",
    "Neha Chawla", "Harish Natarajan", "Divya Menon", "Suresh Pillai", "Ishaan Roy",
    "Tanvi Kulkarni", "Manoj Tiwari", "Swati Saxena", "Naveen Reddy", "Gayatri Sen",
    "Varun Dhawan", "Aishwarya Bose", "Rajesh Khanna", "Siddharth Jain", "Ritu Agrawal",
    "Manish Pandey", "Shruti Haasan", "Nitin Gadkari", "Priyanka Chopra", "Gaurav Seth",
    "Ankita Lokhande", "Abhishek Bachchan", "Radhika Apte", "Sanjay Dutt", "Juhi Chawla",
    "Kishore Kumar", "Tara Sutaria", "Anand Mahindra", "Shreya Ghoshal", "Vijay Sethupathi",
    "Geeta Phogat", "Ashok Leyland", "Smriti Mandhana", "Rishabh Pant", "Sanika Kadam"
]

PAYMENT_METHODS = ["UPI", "CREDIT_CARD", "DEBIT_CARD", "NETBANKING"]
STANDARD_AMOUNTS = [
    349.00, 799.00, 1250.00, 2499.00, 3200.00, 4800.00, 5000.00, 6450.00,
    8750.00, 12500.00, 15999.00, 18500.00, 25000.00, 34999.00, 49990.00
]

def generate_synthetic_dataset(output_dir: Path = settings.DATA_DIR, seed: int = 42, total_records: int = 120) -> dict:
    """
    Generates deterministic 120+ synthetic records across 3 financial sources:
    1. Orders (Internal Ledger)
    2. Payments (Gateway)
    3. Settlements (Bank)
    4. Ground Truth (Verification reference)
    """
    random.seed(seed)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    orders = []
    payments = []
    settlements = []
    ground_truth = []
    
    base_date = datetime(2026, 9, 1, 9, 0, 0)
    
    # Predefined distribution for 120 records:
    # 75 MATCHED
    # 10 MATCHED_WITH_TOLERANCE (diff <= ₹10)
    # 10 AMOUNT_MISMATCH (diff > ₹10, e.g. ₹500, ₹1200)
    # 6 MISSING_PAYMENT (order with no payment record)
    # 6 MISSING_SETTLEMENT (payment with no settlement record)
    # 4 DUPLICATE (duplicate transaction_id)
    # 4 DATE_MISMATCH (settlement date precedes payment or >30 days drift)
    # 5 UNRESOLVED (multi-field conflict, e.g., failed status + settled amount)
    
    scenarios = (
        ["MATCHED"] * 75 +
        ["MATCHED_WITH_TOLERANCE"] * 10 +
        ["AMOUNT_MISMATCH"] * 10 +
        ["MISSING_PAYMENT"] * 6 +
        ["MISSING_SETTLEMENT"] * 6 +
        ["DUPLICATE"] * 4 +
        ["DATE_MISMATCH"] * 4 +
        ["UNRESOLVED"] * 5
    )
    
    # Shuffle scenarios deterministically
    random.shuffle(scenarios)
    
    duplicate_counter = 0
    
    for i, scenario in enumerate(scenarios, start=1):
        order_num = 1000 + i
        txn_num = 2000 + i
        stl_num = 3000 + i
        
        order_id = f"ORD-{order_num}"
        txn_id = f"TXN-{txn_num}"
        stl_id = f"STL-{stl_num}"
        
        customer = random.choice(INDIAN_NAMES)
        expected_amt = random.choice(STANDARD_AMOUNTS)
        pay_method = random.choice(PAYMENT_METHODS)
        bank_ref = f"HDFC{random.randint(10000000, 99999999)}"
        
        order_time = base_date + timedelta(days=i % 15, hours=i % 8, minutes=random.randint(0, 59))
        pay_time = order_time + timedelta(minutes=random.randint(1, 15))
        stl_time = pay_time + timedelta(days=1, hours=random.randint(2, 6)) # Standard T+1 / T+2
        
        # Formatting with realistic quirks (whitespace, uppercase/lowercase) in some records
        if i % 7 == 0:
            raw_order_id = f" {order_id} "
            raw_txn_id = f" {txn_id.lower()} "
        else:
            raw_order_id = order_id
            raw_txn_id = txn_id
            
        raw_stl_id = stl_id
        
        paid_amt = expected_amt
        settled_amt = expected_amt
        expected_status = scenario
        expected_diff = 0.0
        notes = f"Scenario: {scenario}"
        
        # Configure scenario-specific mutations
        if scenario == "MATCHED":
            # Perfect 3-way match
            pass
            
        elif scenario == "MATCHED_WITH_TOLERANCE":
            # Difference between ₹1.50 and ₹8.50 (within default ₹10 tolerance)
            tolerance_delta = random.choice([2.50, 4.00, 5.00, 7.50, 9.00])
            settled_amt = round(expected_amt - tolerance_delta, 2)
            expected_diff = tolerance_delta
            notes = f"Minor settlement delta of ₹{tolerance_delta} (within ₹10 tolerance)"
            
        elif scenario == "AMOUNT_MISMATCH":
            # Discrepancy > ₹10 (e.g. ₹500, ₹1250, ₹2500)
            mismatch_delta = random.choice([250.00, 500.00, 750.00, 1200.00, 2500.00])
            settled_amt = round(expected_amt - mismatch_delta, 2)
            expected_diff = mismatch_delta
            notes = f"Under-settlement discrepancy of ₹{mismatch_delta}"
            
        elif scenario == "MISSING_PAYMENT":
            # Payment was dropped / gateway never reported
            notes = "Order created but payment gateway webhook dropped/missing"
            
        elif scenario == "MISSING_SETTLEMENT":
            # Payment captured, but bank settlement missing
            notes = "Payment captured but omitted from bank settlement batch"
            
        elif scenario == "DUPLICATE":
            # Duplicate transaction ID
            duplicate_counter += 1
            if duplicate_counter % 2 == 1:
                # Store the primary duplicate reference
                raw_txn_id = f"TXN-DUP-200{duplicate_counter}"
                notes = "Duplicate transaction instance A"
            else:
                raw_txn_id = f"TXN-DUP-200{duplicate_counter - 1}"
                notes = "Duplicate transaction instance B (collision)"
                
        elif scenario == "DATE_MISMATCH":
            # Settlement date occurs BEFORE payment date, or >35 days delay
            if i % 2 == 0:
                stl_time = pay_time - timedelta(days=2)
                notes = "Settlement timestamp is recorded before payment capture timestamp"
            else:
                stl_time = pay_time + timedelta(days=45)
                notes = "Settlement delayed by >35 days (abnormal settlement drift)"
                
        elif scenario == "UNRESOLVED":
            # Multi-point failure: order failed + settled amount mismatch + empty bank ref
            paid_amt = round(expected_amt * 0.5, 2)
            settled_amt = round(expected_amt * 0.3, 2)
            expected_diff = round(expected_amt - settled_amt, 2)
            bank_ref = "INVALID_REF"
            notes = "Multi-anomaly conflict: partial capture with invalid bank reference and amount mismatch"

        # 1. Order Record (Always exists in ledger)
        orders.append({
            "order_id": raw_order_id,
            "customer_name": customer,
            "order_date": order_time.strftime("%Y-%m-%d %H:%M:%S"),
            "expected_amount": f"₹{expected_amt:,.2f}" if i % 5 == 0 else expected_amt,
            "currency": "INR",
            "order_status": "COMPLETED" if scenario != "UNRESOLVED" else "FAILED"
        })
        
        # 2. Payment Record
        if scenario != "MISSING_PAYMENT":
            payments.append({
                "transaction_id": raw_txn_id,
                "order_id": raw_order_id,
                "payment_date": pay_time.strftime("%Y-%m-%d %H:%M:%S"),
                "paid_amount": paid_amt,
                "payment_status": "SUCCESS" if scenario != "UNRESOLVED" else "PARTIAL",
                "payment_method": pay_method
            })
            
        # 3. Settlement Record
        if scenario not in ["MISSING_PAYMENT", "MISSING_SETTLEMENT"]:
            settlements.append({
                "settlement_id": raw_stl_id,
                "transaction_id": raw_txn_id,
                "settlement_date": stl_time.strftime("%Y-%m-%d %H:%M:%S"),
                "settled_amount": settled_amt,
                "settlement_status": "SETTLED" if scenario != "UNRESOLVED" else "ON_HOLD",
                "bank_reference": bank_ref
            })
            
        # 4. Ground Truth Record
        ground_truth.append({
            "order_id": order_id.strip(),
            "transaction_id": raw_txn_id.strip().upper(),
            "expected_status": expected_status,
            "expected_difference": expected_diff,
            "notes": notes
        })

    # Save to CSV files
    df_orders = pd.DataFrame(orders)
    df_payments = pd.DataFrame(payments)
    df_settlements = pd.DataFrame(settlements)
    df_ground_truth = pd.DataFrame(ground_truth)
    
    orders_path = output_dir / "orders.csv"
    payments_path = output_dir / "payments.csv"
    settlements_path = output_dir / "settlements.csv"
    gt_path = output_dir / "ground_truth.csv"
    
    df_orders.to_csv(orders_path, index=False)
    df_payments.to_csv(payments_path, index=False)
    df_settlements.to_csv(settlements_path, index=False)
    df_ground_truth.to_csv(gt_path, index=False)
    
    return {
        "orders_count": len(df_orders),
        "payments_count": len(df_payments),
        "settlements_count": len(df_settlements),
        "ground_truth_count": len(df_ground_truth),
        "files": {
            "orders": str(orders_path),
            "payments": str(payments_path),
            "settlements": str(settlements_path),
            "ground_truth": str(gt_path),
        }
    }

if __name__ == "__main__":
    res = generate_synthetic_dataset()
    print("Dataset Generated:", res)
