from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application runtime configuration loaded from environment variables or .env file."""
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    database_url: str = "sqlite:///./rentwise.db"
    max_file_size_bytes: int = 10 * 1024 * 1024  # 10MB safety boundary for uploads

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Returns cached settings instance to avoid reading the disk on every request."""
    return Settings()
