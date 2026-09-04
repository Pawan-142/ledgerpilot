from fastapi import APIRouter
import pandas as pd
from app.config import settings
from app.services.groq_agent import groq_agent

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health_status():
    """
    Returns system health, dataset status, and Groq configuration.
    """
    orders_csv = settings.DATA_DIR / "orders.csv"
    record_count = 0
    dataset_ready = False
    
    if orders_csv.exists():
        try:
            df = pd.read_csv(orders_csv)
            record_count = len(df)
            dataset_ready = record_count >= 50
        except Exception:
            pass

    return {
        "status": "HEALTHY",
        "version": "1.0.0",
        "dataset_ready": dataset_ready,
        "record_count": record_count,
        "groq_configured": groq_agent.is_configured(),
        "groq_model": settings.GROQ_MODEL,
        "database_connected": True
    }
