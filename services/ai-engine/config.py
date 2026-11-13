"""
Smart Car Rental — AI Engine Configuration
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    ai_engine_secret: str = ""
    model_confidence_threshold: float = 0.45

    class Config:
        env_file = ".env"


settings = Settings()
