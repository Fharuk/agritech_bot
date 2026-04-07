"""Terra VI — main.py (Phase 2)"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import diagnose, health, history
from app.api import analytics, admin, whatsapp
from app.config import get_settings
from app.models.database import init_db
from app.services.treatment import get_meta

settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    meta = get_meta()
    logger.info("Terra VI Phase 2 starting | v%s crops=%s", meta.get("version"), meta.get("crops_covered"))
    await init_db()
    logger.info("DB ready: %s", settings.database_url)
    settings.models_path.mkdir(parents=True, exist_ok=True)

    from app.services.vision import (
        download_tomato_model, download_maize_model, download_rice_model,
        _load_tomato_model, _load_maize_model, _load_rice_model,
    )

    for name, ready, download_fn, load_fn in [
        ("Tomato ViT (~350MB)", settings.tomato_model_ready, download_tomato_model, _load_tomato_model),
        ("Maize TF (~25MB)", settings.maize_model_ready, download_maize_model, _load_maize_model),
        ("Rice SigLIP2 (~93MB)", settings.rice_model_ready, download_rice_model, _load_rice_model),
    ]:
        if not ready:
            logger.info("%s not found — downloading…", name)
            if not download_fn():
                logger.warning("%s download FAILED — restart to retry", name)
                continue
        logger.info("Loading %s into memory…", name)
        result = load_fn()
        loaded = result[0] if isinstance(result, tuple) else result
        if loaded is not None:
            logger.info("%s ready ✓", name)
        else:
            logger.warning("%s load failed — check logs above", name)

    if settings.twilio_configured:
        logger.info("Twilio WhatsApp bot configured ✓")
    if settings.should_allow_all_origins:
        logger.info("CORS: development mode — all origins allowed")
    yield
    logger.info("Terra VI shutting down.")


app = FastAPI(
    title="Terra VI", version="2.0.0",
    description="AI-powered crop disease diagnostics for Nigerian smallholder farmers. 100% local inference.",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

if settings.should_allow_all_origins:
    app.add_middleware(CORSMiddleware, allow_origins=["*"],
                       allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
else:
    app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins_list,
                       allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(health.router)
app.include_router(diagnose.router, prefix="/api/v1")
app.include_router(history.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(whatsapp.router, prefix="/api/v1")
