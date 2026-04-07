from datetime import datetime
from typing import Any
from pydantic import BaseModel


class PhotoQualityOut(BaseModel):
    score: float
    passed: bool
    issues: list[str] = []
    suggestion: str = ""


class OrganicTreatment(BaseModel):
    step_1: str; step_2: str
    step_3: str | None = None; step_4: str | None = None; step_5: str | None = None
    source: str

class ChemicalTreatment(BaseModel):
    product_name: str | None = None; common_brand_in_nigeria: str | None = None
    dosage: str | None = None; frequency: str | None = None
    phe_warning: str | None = None; source: str | None = None
    option_1: dict[str, Any] | None = None; option_2: dict[str, Any] | None = None
    note: str | None = None

class SeverityLevels(BaseModel):
    mild: str; moderate: str; severe: str

class TreatmentEntry(BaseModel):
    id: str; crop: str; disease_name: str; local_name: str
    pathogen: str; type: str; visual_markers: list[str]
    severity: SeverityLevels
    organic_treatment: OrganicTreatment
    chemical_treatment: ChemicalTreatment
    prevention: list[str]; when_to_seek_extension_officer: str
    critical_note: str | None = None
    resistant_varieties: dict[str, Any] | None = None

class DiagnoseResponse(BaseModel):
    session_id: str
    status: str   # "diagnosed" | "low_confidence" | "error" | "coming_soon" | "photo_quality_fail"
    crop: str
    # Diagnosed
    disease_slug: str | None = None
    disease_name: str | None = None
    detected_label: str | None = None
    confidence: float | None = None
    model_used: str | None = None
    inference_ms: int | None = None
    treatment: TreatmentEntry | None = None
    # Severity (Phase 2)
    severity_score: int | None = None       # 1–10 urgency
    severity_label: str | None = None       # "Monitor" | "Treat this week" | "Act today" | "Emergency"
    # Photo quality (Phase 2)
    photo_quality: PhotoQualityOut | None = None
    # Low confidence
    low_confidence_message: str | None = None
    detected_label_low_conf: str | None = None
    # Error
    error_message: str | None = None

class HistoryItem(BaseModel):
    session_id: str; crop: str; channel: str; created_at: datetime
    disease_slug: str | None; disease_name: str | None
    confidence: float | None; treatment_found: bool; low_confidence: bool
    inference_ms: int | None; model_used: str | None = None
    severity_score: int | None = None
    model_config = {"from_attributes": True}

class HistoryResponse(BaseModel):
    items: list[HistoryItem]; total: int

class AnalyticsResponse(BaseModel):
    total_diagnoses: int
    diagnoses_by_crop: dict[str, int]
    top_diseases: list[dict[str, Any]]
    diagnoses_by_day: list[dict[str, Any]]
    diagnoses_by_state: dict[str, int]
    low_confidence_rate: float
    avg_confidence: float
    avg_inference_ms: float
