from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application runtime configuration loaded from environment variables or .env file."""
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    database_url: str = "sqlite:///./rentwise.db"
    max_file_size_bytes: int = 10 * 1024 * 1024  # 10MB safety boundary for uploads
    
    # Comma-separated list of allowed frontend origin URLs
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    
    # Rate limit: Maximum allowed requests per IP per minute on AI and upload routes
    rate_limit_per_minute: int = 20

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parses comma-separated cors_origins string into a clean list for FastAPI CORS middleware."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Returns cached settings instance to avoid reading the disk on every request."""
    return Settings()
