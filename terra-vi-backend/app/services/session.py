import logging, uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.orm_models import DiagnosisResult, FarmerSession
from app.services.vision import VisionResult

logger = logging.getLogger(__name__)


async def create_session(db: AsyncSession, crop: str, channel: str = "web",
                         language: str = "en", state_ng: str | None = None) -> FarmerSession:
    s = FarmerSession(session_id=str(uuid.uuid4()), crop=crop, channel=channel,
                      language=language, state_ng=state_ng)
    db.add(s); await db.flush()
    return s


async def save_diagnosis(db: AsyncSession, session_id: str,
                         vision_result: VisionResult, treatment_found: bool) -> DiagnosisResult:
    pq = vision_result.photo_quality
    r = DiagnosisResult(
        session_id=session_id,
        model_used=vision_result.model_used,
        disease_slug=vision_result.slug,
        confidence=vision_result.confidence,
        raw_model_response=vision_result.label[:500] if vision_result.label else None,
        treatment_found=treatment_found,
        low_confidence=vision_result.low_confidence,
        inference_ms=vision_result.inference_ms,
        severity_score=vision_result.severity_score,
        photo_quality_score=pq.score if pq else None,
    )
    db.add(r); await db.flush()
    return r


async def get_recent_diagnoses(db: AsyncSession, limit: int = 20,
                                offset: int = 0) -> tuple[list[dict], int]:
    stmt = (
        select(FarmerSession, DiagnosisResult)
        .join(DiagnosisResult, FarmerSession.session_id == DiagnosisResult.session_id)
        .order_by(FarmerSession.created_at.desc())
        .limit(limit).offset(offset)
    )
    rows = (await db.execute(stmt)).all()
    count_rows = (await db.execute(
        select(func.count()).select_from(FarmerSession)
        .join(DiagnosisResult, FarmerSession.session_id == DiagnosisResult.session_id)
    )).scalar()
    items = []
    for fs, d in rows:
        items.append({
            "session_id": fs.session_id, "crop": fs.crop, "channel": fs.channel,
            "created_at": fs.created_at, "disease_slug": d.disease_slug,
            "disease_name": None, "confidence": d.confidence,
            "treatment_found": d.treatment_found, "low_confidence": d.low_confidence,
            "inference_ms": d.inference_ms, "model_used": d.model_used,
            "severity_score": d.severity_score,
        })
    return items, int(count_rows or 0)


async def get_analytics(db: AsyncSession) -> dict:
    """Aggregate data for the analytics dashboard."""
    from sqlalchemy import text, cast, Date
    from datetime import datetime, timezone

    # Total diagnoses
    total = (await db.execute(select(func.count(DiagnosisResult.id)))).scalar() or 0

    # By crop
    crop_rows = (await db.execute(
        select(FarmerSession.crop, func.count().label("n"))
        .join(DiagnosisResult, FarmerSession.session_id == DiagnosisResult.session_id)
        .group_by(FarmerSession.crop)
    )).all()
    by_crop = {r.crop: r.n for r in crop_rows}

    # Top diseases
    disease_rows = (await db.execute(
        select(DiagnosisResult.disease_slug, func.count().label("n"))
        .where(DiagnosisResult.disease_slug.isnot(None))
        .group_by(DiagnosisResult.disease_slug)
        .order_by(func.count().desc())
        .limit(10)
    )).all()
    top_diseases = [{"slug": r.disease_slug, "count": r.n} for r in disease_rows]

    # By day (last 30 days)
    day_rows = (await db.execute(
        select(
            func.date(FarmerSession.created_at).label("day"),
            func.count().label("n")
        )
        .join(DiagnosisResult, FarmerSession.session_id == DiagnosisResult.session_id)
        .group_by(func.date(FarmerSession.created_at))
        .order_by(func.date(FarmerSession.created_at).desc())
        .limit(30)
    )).all()
    by_day = [{"date": str(r.day), "count": r.n} for r in reversed(day_rows)]

    # By Nigerian state
    state_rows = (await db.execute(
        select(FarmerSession.state_ng, func.count().label("n"))
        .where(FarmerSession.state_ng.isnot(None))
        .group_by(FarmerSession.state_ng)
        .order_by(func.count().desc())
    )).all()
    by_state = {r.state_ng: r.n for r in state_rows}

    # Aggregate stats
    stats = (await db.execute(
        select(
            func.avg(DiagnosisResult.confidence).label("avg_conf"),
            func.avg(DiagnosisResult.inference_ms).label("avg_ms"),
            func.sum(func.cast(DiagnosisResult.low_confidence, Integer)).label("low_conf_count"),
        )
    )).first()

    from sqlalchemy import Integer as Integer2
    low_conf_rate = float(stats.low_conf_count or 0) / total if total else 0.0

    return {
        "total_diagnoses": total,
        "diagnoses_by_crop": by_crop,
        "top_diseases": top_diseases,
        "diagnoses_by_day": by_day,
        "diagnoses_by_state": by_state,
        "low_confidence_rate": round(low_conf_rate, 3),
        "avg_confidence": round(float(stats.avg_conf or 0), 3),
        "avg_inference_ms": round(float(stats.avg_ms or 0), 1),
    }
