import logging
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import get_db
from app.schemas.diagnose import DiagnoseResponse, PhotoQualityOut
from app.services.session import create_session, save_diagnosis
from app.services.treatment import get_low_confidence_message, get_treatment
from app.services.vision import classify_image

logger = logging.getLogger(__name__)
router = APIRouter(tags=["diagnosis"])

_ALLOWED_CROPS = {"tomato", "maize", "rice", "cassava", "yam", "groundnut"}
_MAX_BYTES = 10 * 1024 * 1024

# Severity labels
def _severity_label(score: int | None) -> str | None:
    if score is None:
        return None
    if score <= 2:  return "Monitor"
    if score <= 5:  return "Treat this week"
    if score <= 8:  return "Act today"
    return "Emergency"


@router.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose(
    crop: str = Form(...),
    image: UploadFile = File(...),
    language: str = Form(default="en"),
    state_ng: str = Form(default=None),
    db: AsyncSession = Depends(get_db),
):
    if crop not in _ALLOWED_CROPS:
        raise HTTPException(422, detail=f"crop must be one of: {', '.join(sorted(_ALLOWED_CROPS))}")
    if not (image.content_type or "").startswith("image/"):
        raise HTTPException(415, detail="Please upload an image file (JPG, PNG, WebP).")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(422, detail="Image file is empty.")
    if len(image_bytes) > _MAX_BYTES:
        raise HTTPException(413, detail="Image too large — maximum 10 MB.")

    session = await create_session(db=db, crop=crop, channel="web",
                                   language=language, state_ng=state_ng)
    session_id = session.session_id
    logger.info("Diagnose: session=%s crop=%s lang=%s state=%s", session_id, crop, language, state_ng)

    result = await classify_image(image_bytes=image_bytes, crop=crop)

    pq_out = PhotoQualityOut(**{
        "score": result.photo_quality.score,
        "passed": result.photo_quality.passed,
        "issues": result.photo_quality.issues,
        "suggestion": result.photo_quality.suggestion,
    }) if result.photo_quality else None

    # Coming soon crops
    if result.error and ("coming soon" in result.error or "no_model" in result.label):
        await save_diagnosis(db=db, session_id=session_id, vision_result=result, treatment_found=False)
        return DiagnoseResponse(
            session_id=session_id, status="coming_soon", crop=crop,
            error_message=result.error, photo_quality=pq_out,
        )

    # Photo quality failure
    if result.label == "photo_quality_fail":
        await save_diagnosis(db=db, session_id=session_id, vision_result=result, treatment_found=False)
        issues_msg = "; ".join(result.photo_quality.issues) if result.photo_quality else ""
        return DiagnoseResponse(
            session_id=session_id, status="photo_quality_fail", crop=crop,
            photo_quality=pq_out,
            low_confidence_message=(
                f"Photo quality check failed: {issues_msg}. "
                f"{result.photo_quality.suggestion if result.photo_quality else ''}"
            ),
        )

    # Infrastructure error
    if result.error and not result.low_confidence:
        logger.error("Inference error session=%s: %s", session_id, result.error)
        await save_diagnosis(db=db, session_id=session_id, vision_result=result, treatment_found=False)
        return DiagnoseResponse(
            session_id=session_id, status="error", crop=crop,
            model_used=result.model_used, inference_ms=result.inference_ms,
            error_message=result.error, photo_quality=pq_out,
        )

    # Low confidence
    if result.low_confidence:
        await save_diagnosis(db=db, session_id=session_id, vision_result=result, treatment_found=False)
        return DiagnoseResponse(
            session_id=session_id, status="low_confidence", crop=crop,
            confidence=result.confidence, model_used=result.model_used,
            inference_ms=result.inference_ms,
            detected_label_low_conf=result.label,
            low_confidence_message=get_low_confidence_message(),
            photo_quality=pq_out,
        )

    # Treatment lookup
    treatment_data = get_treatment(result.slug)
    if treatment_data is None:
        await save_diagnosis(db=db, session_id=session_id, vision_result=result, treatment_found=False)
        return DiagnoseResponse(
            session_id=session_id, status="low_confidence", crop=crop,
            confidence=result.confidence, model_used=result.model_used,
            inference_ms=result.inference_ms, detected_label_low_conf=result.label,
            low_confidence_message=(
                f"The model detected '{result.label}' but this condition is not yet in our "
                "treatment database. Please consult your nearest agricultural extension officer."
            ),
            photo_quality=pq_out,
        )

    await save_diagnosis(db=db, session_id=session_id, vision_result=result, treatment_found=True)
    logger.info("Success: session=%s slug=%s conf=%.2f severity=%s ms=%d",
                session_id, result.slug, result.confidence, result.severity_score, result.inference_ms)

    return DiagnoseResponse(
        session_id=session_id, status="diagnosed", crop=crop,
        disease_slug=result.slug,
        disease_name=treatment_data.get("disease_name"),
        detected_label=result.label,
        confidence=result.confidence,
        model_used=result.model_used,
        inference_ms=result.inference_ms,
        treatment=treatment_data,
        severity_score=result.severity_score,
        severity_label=_severity_label(result.severity_score),
        photo_quality=pq_out,
    )
