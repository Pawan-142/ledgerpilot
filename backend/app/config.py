import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "LedgerPilot"
    PROJECT_DESCRIPTION: str = "AI Finance Controller — Reconcile. Investigate. Control."
    API_V1_STR: str = "/api"
    
    # Groq Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    # Reconciliation Config
    DEFAULT_TOLERANCE: float = 10.00
    
    # Paths
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = BASE_DIR / "data"
    DB_PATH: Path = BASE_DIR / "ledgerpilot.db"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/ledgerpilot.db"

settings = Settings()
