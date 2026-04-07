"""
WhatsApp Bot webhook — Twilio sandbox.
Farmers send a crop photo → get back diagnosis in plain text.

Setup:
  1. Create free Twilio account at https://www.twilio.com
  2. Enable WhatsApp Sandbox at console.twilio.com/messaging/try-it-out/whatsapp-learn
  3. Add to .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
  4. Set sandbox webhook URL to: https://your-backend.fly.dev/api/v1/whatsapp/webhook
  5. Users join sandbox by sending: 'join <sandbox-keyword>' to +1 415 523 8886

Farmer flow:
  Farmer: [sends leaf photo]
  Bot:    "Select crop — reply with: 1 Tomato  2 Maize  3 Rice"
  Farmer: "1"
  Bot:    [runs diagnosis, returns plain-text result]
"""
import logging
from urllib.parse import urljoin

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.database import get_db
from app.services.session import create_session, save_diagnosis
from app.services.treatment import get_treatment
from app.services.vision import classify_image, COMING_SOON_CROPS

logger = logging.getLogger(__name__)
router = APIRouter(tags=["whatsapp"])
settings = get_settings()

# Simple in-memory state: phone → {"step": "await_crop"|"await_image", "image_url": str}
# For production, use Redis or DB
_session_state: dict[str, dict] = {}

CROP_MAP = {"1": "tomato", "2": "maize", "3": "rice",
            "tomato": "tomato", "maize": "maize", "rice": "rice"}


def _twiml_response(message: str) -> PlainTextResponse:
    """Return a Twilio TwiML MessagingResponse."""
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>{message}</Message></Response>"""
    return PlainTextResponse(content=xml, media_type="text/xml")


async def _fetch_twilio_image(media_url: str) -> bytes:
    """Download image from Twilio media URL (authenticated)."""
    import httpx
    async with httpx.AsyncClient() as client:
        r = await client.get(
            media_url,
            auth=(settings.twilio_account_sid, settings.twilio_auth_token),
            timeout=30.0,
        )
        r.raise_for_status()
        return r.content


@router.post("/whatsapp/webhook")
async def whatsapp_webhook(
    request: Request,
    From: str = Form(...),
    Body: str = Form(default=""),
    NumMedia: int = Form(default=0),
    MediaUrl0: str = Form(default=""),
    db: AsyncSession = Depends(get_db),
):
    if not settings.twilio_configured:
        return _twiml_response(
            "Terra VI WhatsApp bot is not configured yet. "
            "Please use the web app at terraVI.app"
        )

    phone = From.replace("whatsapp:", "").strip()
    body = Body.strip().lower()
    state = _session_state.get(phone, {})

    # New conversation or photo received
    if NumMedia > 0 and MediaUrl0:
        state["image_url"] = MediaUrl0
        state["step"] = "await_crop"
        _session_state[phone] = state
        return _twiml_response(
            "🌿 *Terra VI* — Crop Disease Diagnostic\n\n"
            "Photo received! Which crop is this?\n\n"
            "Reply with a number:\n"
            "1️⃣ Tomato\n"
            "2️⃣ Maize\n"
            "3️⃣ Rice\n\n"
            "Type the number (1, 2, or 3)."
        )

    # Crop selection
    if state.get("step") == "await_crop":
        crop = CROP_MAP.get(body)
        if not crop:
            return _twiml_response("Please reply with 1 (Tomato), 2 (Maize), or 3 (Rice).")

        image_url = state.get("image_url")
        if not image_url:
            _session_state.pop(phone, None)
            return _twiml_response(
                "Session expired. Please send a new photo of your crop leaf."
            )

        # Run diagnosis
        try:
            image_bytes = await _fetch_twilio_image(image_url)
        except Exception as exc:
            logger.error("WhatsApp image fetch failed: %s", exc)
            _session_state.pop(phone, None)
            return _twiml_response(
                "Could not retrieve your photo. Please send it again."
            )

        session = await create_session(db=db, crop=crop, channel="whatsapp")
        result = await classify_image(image_bytes=image_bytes, crop=crop)
        _session_state.pop(phone, None)  # clear state after processing

        # Build plain-text response
        if result.error:
            await save_diagnosis(db=db, session_id=session.session_id,
                                 vision_result=result, treatment_found=False)
            return _twiml_response(
                f"❌ Diagnostic error: {result.error}\n\n"
                "Please try again or contact your agricultural extension officer."
            )

        if result.low_confidence:
            await save_diagnosis(db=db, session_id=session.session_id,
                                 vision_result=result, treatment_found=False)
            return _twiml_response(
                "⚠️ *Low confidence result*\n\n"
                "The image was not clear enough for a reliable diagnosis.\n\n"
                "Please retake the photo:\n"
                "• In direct natural daylight\n"
                "• Focusing on the most affected leaf\n"
                "• Holding the phone steady\n\n"
                "Send the new photo when ready."
            )

        treatment = get_treatment(result.slug)
        await save_diagnosis(db=db, session_id=session.session_id,
                             vision_result=result, treatment_found=bool(treatment))

        if not treatment:
            return _twiml_response(
                f"🔍 Detected: *{result.label}* ({round(result.confidence * 100)}% confidence)\n\n"
                "This condition is not yet in our treatment database.\n"
                "Please consult your nearest agricultural extension officer."
            )

        # Severity emoji
        sev = result.severity_score or 0
        sev_emoji = "🟢" if sev <= 2 else "🟡" if sev <= 5 else "🔴" if sev <= 8 else "🚨"
        sev_label_text = "Monitor" if sev <= 2 else "Treat this week" if sev <= 5 else \
                         "Act today" if sev <= 8 else "EMERGENCY"

        organic = treatment.get("organic_treatment", {})
        steps = [organic.get(f"step_{i}") for i in range(1, 4) if organic.get(f"step_{i}")]

        chem = treatment.get("chemical_treatment", {})
        chem_text = ""
        if chem.get("product_name") and chem["product_name"] != "No treatment needed":
            brands = chem.get("common_brand_in_nigeria", "")
            dosage = chem.get("dosage", "")
            chem_text = f"\n💊 *Chemical*: {chem['product_name']}\nBrands: {brands}\nDose: {dosage}"

        steps_text = "\n".join(f"{i+1}. {s}" for i, s in enumerate(steps))

        msg = (
            f"🌿 *Terra VI Diagnosis*\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"🔍 *Disease*: {treatment['disease_name']}\n"
            f"🌾 *Crop*: {treatment['crop'].capitalize()}\n"
            f"📊 *Confidence*: {round(result.confidence * 100)}%\n"
            f"{sev_emoji} *Urgency*: {sev_label_text} ({sev}/10)\n\n"
            f"🌱 *Organic treatment*:\n{steps_text}"
            f"{chem_text}\n\n"
            f"⚠️ {treatment.get('when_to_seek_extension_officer', '')[:150]}\n\n"
            f"For full details: terraVI.app"
        )
        return _twiml_response(msg)

    # Default / welcome
    return _twiml_response(
        "🌿 *Welcome to Terra VI*\n\n"
        "Send a clear photo of your crop leaf and I will diagnose any disease.\n\n"
        "Supported crops: Tomato 🍅 | Maize 🌽 | Rice 🌾\n\n"
        "Simply send your leaf photo to get started."
    )
