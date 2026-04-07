from fastapi import APIRouter
from pydantic import BaseModel
from app.config import get_settings
from app.services.treatment import get_meta, list_slugs_for_crop
from app.services.vision import get_model_status

router = APIRouter(tags=["health"])
settings = get_settings()


class HealthResponse(BaseModel):
    status: str; environment: str
    tomato_model_downloaded: bool; tomato_model_id: str
    maize_model_downloaded: bool; maize_model_id: str
    rice_model_downloaded: bool; rice_model_id: str
    ready_to_diagnose_tomato: bool; ready_to_diagnose_maize: bool; ready_to_diagnose_rice: bool
    treatment_db_loaded: bool; models_directory: str
    twilio_configured: bool

class InfoResponse(BaseModel):
    version: str; crops_covered: list[str]
    disease_entries: dict[str, list[str]]; disclaimer: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    ms = get_model_status()
    try:
        meta = get_meta(); db_ok = bool(meta)
    except Exception:
        db_ok = False
    return HealthResponse(
        status="ok", environment=settings.environment,
        tomato_model_downloaded=ms["tomato_model_downloaded"], tomato_model_id=ms["tomato_model_id"],
        maize_model_downloaded=ms["maize_model_downloaded"], maize_model_id=ms["maize_model_id"],
        rice_model_downloaded=ms["rice_model_downloaded"], rice_model_id=ms["rice_model_id"],
        ready_to_diagnose_tomato=ms["tomato_model_downloaded"] and db_ok,
        ready_to_diagnose_maize=ms["maize_model_downloaded"] and db_ok,
        ready_to_diagnose_rice=ms["rice_model_downloaded"] and db_ok,
        treatment_db_loaded=db_ok,
        models_directory=ms["tomato_model_path"].replace("/tomato-vit", ""),
        twilio_configured=settings.twilio_configured,
    )


@router.get("/info", response_model=InfoResponse)
async def info():
    meta = get_meta()
    crops = ["tomato", "maize", "rice"]
    return InfoResponse(
        version=meta.get("version", "unknown"), crops_covered=crops,
        disease_entries={c: list_slugs_for_crop(c) for c in crops},
        disclaimer=meta.get("disclaimer", ""),
    )
