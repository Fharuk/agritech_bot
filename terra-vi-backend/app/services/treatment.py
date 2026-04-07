import json
import logging
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger(__name__)

_TREATMENTS_PATH = Path(__file__).parent.parent / "data" / "treatments.json"

# Keys in the JSON that are metadata, not disease entries
_META_KEYS = {"_meta"}


@lru_cache(maxsize=1)
def _load_treatments() -> dict:
    """
    Loads and caches the entire treatments.json.
    Called once at first use — subsequent calls return the cached dict.
    If the file is missing or malformed, raises immediately so the server
    fails loudly at startup rather than silently at query time.
    """
    if not _TREATMENTS_PATH.exists():
        raise FileNotFoundError(
            f"treatments.json not found at {_TREATMENTS_PATH}. "
            "Copy it to backend/app/data/treatments.json before starting the server."
        )

    with open(_TREATMENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    disease_count = len([k for k in data if k not in _META_KEYS])
    logger.info("Loaded treatments.json — %d disease entries", disease_count)
    return data


def get_treatment(slug: str) -> dict | None:
    """
    Returns the full treatment entry for a given disease slug,
    or None if the slug doesn't exist in the database.

    Example:
        entry = get_treatment("maize_fall_armyworm")
    """
    treatments = _load_treatments()
    return treatments.get(slug)


def get_confidence_threshold(slug: str) -> float:
    """
    Returns the per-disease confidence threshold from the JSON.
    Falls back to 0.65 (global default) if the entry or field is missing.
    """
    entry = get_treatment(slug)
    if entry is None:
        return 0.65
    return entry.get("vision_confidence_threshold", 0.65)


def list_slugs_for_crop(crop: str) -> list[str]:
    """
    Returns all disease slugs that belong to a given crop.
    Used to build the per-crop section of the Gemini prompt.

    Example:
        list_slugs_for_crop("tomato")
        → ["tomato_early_blight", "tomato_late_blight", "tomato_leaf_miner"]
    """
    treatments = _load_treatments()
    return [
        slug
        for slug, entry in treatments.items()
        if slug not in _META_KEYS and entry.get("crop") == crop
    ]


def get_visual_markers(slug: str) -> list[str]:
    """
    Returns the visual_markers list for a slug.
    Used by the vision service to build the Gemini classification prompt.
    """
    entry = get_treatment(slug)
    if entry is None:
        return []
    return entry.get("visual_markers", [])


def get_meta() -> dict:
    """Returns the _meta block — useful for health checks and API info endpoints."""
    return _load_treatments().get("_meta", {})


def get_low_confidence_message() -> str:
    """Returns the global low-confidence user message from _meta."""
    meta = get_meta()
    return meta.get(
        "low_confidence_response",
        "The image is not clear enough for a reliable diagnosis. "
        "Please retake the photo in good natural light and try again.",
    )
