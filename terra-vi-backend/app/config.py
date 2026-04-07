"""
Terra VI — config.py  (Phase 2)
All inference runs locally after a one-time model download.
"""
from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    # HuggingFace token (optional — only for private models)
    huggingface_token: str = ""

    # Model cache directory
    models_dir: str = "models"

    # Model IDs on HuggingFace
    tomato_model_id: str = "wellCh4n/tomato-leaf-disease-classification-vit"
    maize_model_id:  str = "eligapris/maize-diseases-detection"
    rice_model_id:   str = "prithivMLmods/Rice-Leaf-Disease"

    # Confidence thresholds
    tomato_confidence_threshold: float = 0.55
    maize_confidence_threshold:  float = 0.55
    rice_confidence_threshold:   float = 0.55

    # Photo quality threshold — below this, reject before inference
    photo_quality_threshold: float = 0.35

    # Database
    database_url: str = "sqlite+aiosqlite:///./terra_vi.db"

    # Admin CMS credentials (change in production!)
    admin_username: str = "admin"
    admin_password: str = "terravi2025"

    # App
    environment: str = "development"
    log_level: str = "INFO"
    allowed_origins: str = (
        "http://localhost:5173,http://localhost:5174,http://localhost:5175,"
        "http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174"
    )
    cors_allow_all: bool = False

    # Twilio (WhatsApp bot — optional)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_number: str = "whatsapp:+14155238886"  # Twilio sandbox default

    @property
    def models_path(self) -> Path:
        p = Path(self.models_dir)
        return p if p.is_absolute() else _BACKEND_ROOT / p

    @property
    def tomato_model_path(self) -> Path:
        return self.models_path / "tomato-vit"

    @property
    def maize_model_path(self) -> Path:
        return self.models_path / "maize-tf"

    @property
    def rice_model_path(self) -> Path:
        return self.models_path / "rice-siglip"

    @property
    def tomato_model_ready(self) -> bool:
        return (self.tomato_model_path / "config.json").exists()

    @property
    def maize_model_ready(self) -> bool:
        return (self.maize_model_path / "saved_model.pb").exists()

    @property
    def rice_model_ready(self) -> bool:
        return (self.rice_model_path / "config.json").exists()

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def is_development(self) -> bool:
        return self.environment.lower() == "development"

    @property
    def should_allow_all_origins(self) -> bool:
        return self.cors_allow_all or self.is_development

    @property
    def twilio_configured(self) -> bool:
        return bool(self.twilio_account_sid and self.twilio_auth_token)


@lru_cache
def get_settings() -> Settings:
    return Settings()
