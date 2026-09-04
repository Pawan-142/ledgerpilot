import re
from datetime import datetime
from typing import Any, Optional, Union
import pandas as pd

class Normalizer:
    """
    Standardization & normalization layer for financial records across
    Orders, Payments, and Bank Settlement feeds.
    """
    
    @staticmethod
    def normalize_id(val: Any) -> Optional[str]:
        if val is None or pd.isna(val):
            return None
        clean_str = str(val).strip().upper()
        # Remove extra duplicate inner spaces if any
        clean_str = re.sub(r'\s+', '', clean_str)
        return clean_str if clean_str else None

    @staticmethod
    def normalize_amount(val: Any) -> Optional[float]:
        if val is None or pd.isna(val):
            return None
        if isinstance(val, (int, float)):
            return round(float(val), 2)
        
        # Clean currency characters, commas, and whitespace
        cleaned = re.sub(r'[₹$,\s]', '', str(val))
        try:
            return round(float(cleaned), 2)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def normalize_date(val: Any) -> Optional[datetime]:
        if val is None or pd.isna(val):
            return None
        if isinstance(val, datetime):
            return val
        
        date_str = str(val).strip()
        formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d",
            "%d-%m-%Y %H:%M:%S",
            "%d/%m/%Y %H:%M:%S",
            "%d-%m-%Y",
            "%d/%m/%Y"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
                
        # Try pandas fallback
        try:
            parsed = pd.to_datetime(date_str)
            if not pd.isna(parsed):
                return parsed.to_pydatetime()
        except Exception:
            pass
            
        return None

    @staticmethod
    def normalize_string(val: Any) -> Optional[str]:
        if val is None or pd.isna(val):
            return None
        clean_str = str(val).strip()
        return clean_str if clean_str else None

    @classmethod
    def normalize_order_record(cls, row: dict) -> dict:
        return {
            "order_id": cls.normalize_id(row.get("order_id")),
            "customer_name": cls.normalize_string(row.get("customer_name")),
            "order_date": cls.normalize_date(row.get("order_date")),
            "expected_amount": cls.normalize_amount(row.get("expected_amount")),
            "currency": cls.normalize_string(row.get("currency")) or "INR",
            "order_status": cls.normalize_string(row.get("order_status")) or "COMPLETED"
        }

    @classmethod
    def normalize_payment_record(cls, row: dict) -> dict:
        return {
            "transaction_id": cls.normalize_id(row.get("transaction_id")),
            "order_id": cls.normalize_id(row.get("order_id")),
            "payment_date": cls.normalize_date(row.get("payment_date")),
            "paid_amount": cls.normalize_amount(row.get("paid_amount")),
            "payment_status": cls.normalize_string(row.get("payment_status")) or "SUCCESS",
            "payment_method": cls.normalize_string(row.get("payment_method")) or "UPI"
        }

    @classmethod
    def normalize_settlement_record(cls, row: dict) -> dict:
        return {
            "settlement_id": cls.normalize_id(row.get("settlement_id")),
            "transaction_id": cls.normalize_id(row.get("transaction_id")),
            "settlement_date": cls.normalize_date(row.get("settlement_date")),
            "settled_amount": cls.normalize_amount(row.get("settled_amount")),
            "settlement_status": cls.normalize_string(row.get("settlement_status")) or "SETTLED",
            "bank_reference": cls.normalize_string(row.get("bank_reference"))
        }
