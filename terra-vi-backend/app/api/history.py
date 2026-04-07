from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db
from app.schemas.diagnose import HistoryResponse
from app.services.session import get_recent_diagnoses
from app.services.treatment import get_treatment

router = APIRouter(tags=["history"])


@router.get("/history", response_model=HistoryResponse)
async def history(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns recent diagnoses in reverse chronological order.
    Resolves disease_name from treatments.json for display purposes.
    """
    items, total = await get_recent_diagnoses(db=db, limit=limit, offset=offset)

    # Enrich with disease_name from the treatment database
    for item in items:
        if item["disease_slug"]:
            entry = get_treatment(item["disease_slug"])
            if entry:
                item["disease_name"] = entry.get("disease_name")

    return HistoryResponse(items=items, total=total)
