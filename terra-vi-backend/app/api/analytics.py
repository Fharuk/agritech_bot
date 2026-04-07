"""GET /api/v1/analytics — Disease outbreak data for dashboard."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import get_db
from app.schemas.diagnose import AnalyticsResponse
from app.services.session import get_analytics

router = APIRouter(tags=["analytics"])


@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(db: AsyncSession = Depends(get_db)):
    return await get_analytics(db)
