"""
Admin CMS endpoints — password-protected.
Allows agronomists to view and update treatment entries without touching code.
"""
import json
import logging
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

from app.config import get_settings
from app.services.treatment import _load_treatments, _TREATMENTS_PATH

logger = logging.getLogger(__name__)
router = APIRouter(tags=["admin"])
security = HTTPBasic()
settings = get_settings()

_META_KEYS = {"_meta"}


def _require_admin(credentials: HTTPBasicCredentials = Depends(security)):
    ok_user = secrets.compare_digest(
        credentials.username.encode(), settings.admin_username.encode()
    )
    ok_pass = secrets.compare_digest(
        credentials.password.encode(), settings.admin_password.encode()
    )
    if not (ok_user and ok_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


@router.get("/admin/treatments")
async def list_treatments(_: str = Depends(_require_admin)):
    """List all disease entries."""
    data = _load_treatments()
    return {k: v for k, v in data.items() if k not in _META_KEYS}


@router.get("/admin/treatments/{slug}")
async def get_treatment_entry(slug: str, _: str = Depends(_require_admin)):
    """Get a single treatment entry by slug."""
    data = _load_treatments()
    if slug not in data or slug in _META_KEYS:
        raise HTTPException(404, detail=f"Slug '{slug}' not found")
    return data[slug]


@router.put("/admin/treatments/{slug}")
async def update_treatment_entry(
    slug: str, body: dict[str, Any], _: str = Depends(_require_admin)
):
    """
    Update a treatment entry.
    The full entry is replaced with the provided body.
    Changes are written to treatments.json on disk and the cache is cleared.
    """
    data = json.loads(_TREATMENTS_PATH.read_text(encoding="utf-8"))
    if slug not in data or slug in _META_KEYS:
        raise HTTPException(404, detail=f"Slug '{slug}' not found")

    body["id"] = slug  # ensure ID stays consistent
    data[slug] = body

    _TREATMENTS_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    # Bust the lru_cache so next request loads fresh data
    _load_treatments.cache_clear()
    logger.info("Admin updated treatment entry: %s", slug)
    return {"status": "updated", "slug": slug}


@router.post("/admin/treatments/{slug}")
async def create_treatment_entry(
    slug: str, body: dict[str, Any], _: str = Depends(_require_admin)
):
    """Add a new disease entry."""
    data = json.loads(_TREATMENTS_PATH.read_text(encoding="utf-8"))
    if slug in data:
        raise HTTPException(409, detail=f"Slug '{slug}' already exists — use PUT to update")

    body["id"] = slug
    data[slug] = body
    _TREATMENTS_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    _load_treatments.cache_clear()
    logger.info("Admin created treatment entry: %s", slug)
    return {"status": "created", "slug": slug}


@router.delete("/admin/treatments/{slug}")
async def delete_treatment_entry(slug: str, _: str = Depends(_require_admin)):
    """Delete a treatment entry."""
    data = json.loads(_TREATMENTS_PATH.read_text(encoding="utf-8"))
    if slug not in data or slug in _META_KEYS:
        raise HTTPException(404, detail=f"Slug '{slug}' not found")
    del data[slug]
    _TREATMENTS_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    _load_treatments.cache_clear()
    logger.info("Admin deleted treatment entry: %s", slug)
    return {"status": "deleted", "slug": slug}


@router.get("/admin/meta")
async def get_meta_block(_: str = Depends(_require_admin)):
    """View the _meta block."""
    return _load_treatments().get("_meta", {})
