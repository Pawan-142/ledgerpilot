import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.services.data_generator import generate_synthetic_dataset
from app.routes import reconciliation, transactions, exceptions, ai, reports, health

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ledgerpilot")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing LedgerPilot database tables...")
    init_db()
    
    orders_csv = settings.DATA_DIR / "orders.csv"
    if not orders_csv.exists():
        logger.info("Generating baseline 120-record synthetic financial dataset...")
        generate_synthetic_dataset(output_dir=settings.DATA_DIR, total_records=120)
    else:
        logger.info("Synthetic financial datasets already present.")
        
    yield
    logger.info("Shutting down LedgerPilot backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(reconciliation.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(exceptions.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_DESCRIPTION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
