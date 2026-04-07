"""
Terra VI — vision.py  (Phase 2)
================================
LOCAL inference. No API key. No cold starts.

Models
------
  Tomato  → wellCh4n/tomato-leaf-disease-classification-vit (PyTorch ViT, 99.67%, 9 classes, ~350MB)
  Maize   → eligapris/maize-diseases-detection (TensorFlow SavedModel, CNN, 4 classes, ~25MB)
  Rice    → prithivMLmods/Rice-Leaf-Disease (PyTorch SigLIP2, 94.8%, 5 classes, ~93MB)
  Others  → "Coming soon" response

Phase 2 additions
-----------------
  Photo quality pre-check: blur, brightness, contrast before inference
  Severity score 1–10: confidence × disease urgency weight
"""

import json
import logging
import time
from dataclasses import dataclass, field
from functools import lru_cache
from io import BytesIO

import numpy as np
from PIL import Image, ImageFilter, ImageStat

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


# ── Dataclasses ────────────────────────────────────────────────────────────────

@dataclass
class PhotoQuality:
    score: float        # 0.0–1.0
    passed: bool
    issues: list[str] = field(default_factory=list)
    suggestion: str = ""


@dataclass
class VisionResult:
    slug: str | None
    label: str
    confidence: float
    model_used: str
    inference_ms: int
    low_confidence: bool
    error: str | None = None
    severity_score: int | None = None
    photo_quality: PhotoQuality | None = None


# ── Severity weights ───────────────────────────────────────────────────────────

SEVERITY_WEIGHTS: dict[str, float] = {
    "tomato_late_blight": 1.0, "tomato_yellow_leaf_curl_virus": 1.0,
    "maize_fall_armyworm": 0.95, "rice_bacterial_blight": 0.95,
    "rice_blast": 0.90, "rice_tungro": 0.90,
    "tomato_early_blight": 0.80, "tomato_bacterial_spot": 0.80,
    "cassava_mosaic_disease": 0.85, "cassava_bacterial_blight": 0.80,
    "maize_northern_leaf_blight": 0.75, "tomato_septoria_leaf_spot": 0.75,
    "tomato_target_spot": 0.70, "tomato_spider_mites": 0.70,
    "tomato_leaf_miner": 0.65, "tomato_leaf_mold": 0.65,
    "rice_brown_spot": 0.65,
    "tomato_healthy": 0.0, "rice_healthy": 0.0,
}


def compute_severity_score(slug: str, confidence: float) -> int:
    import math
    weight = SEVERITY_WEIGHTS.get(slug, 0.7)
    if weight == 0.0:
        return 1
    return max(1, min(10, math.ceil(confidence * weight * 10)))


# ── Photo quality checker ──────────────────────────────────────────────────────

def assess_photo_quality(img: Image.Image) -> PhotoQuality:
    """Lightweight pre-inference quality assessment."""
    issues: list[str] = []
    scores: list[float] = []
    w, h = img.size

    if w < 100 or h < 100:
        return PhotoQuality(score=0.0, passed=False,
                            issues=["Image resolution too low"],
                            suggestion="Use a photo taken directly with your phone camera.")

    # Blur via Laplacian edge variance
    gray = img.convert("L").resize((224, 224))
    arr = np.array(gray, dtype=np.float32)
    edges = np.array(Image.fromarray(arr.astype(np.uint8)).filter(ImageFilter.FIND_EDGES))
    blur_score = min(1.0, float(np.var(edges)) / 800.0)
    scores.append(blur_score)
    if blur_score < 0.15:
        issues.append("Image appears blurry — hold the camera steady")

    # Brightness
    stat = ImageStat.Stat(img.convert("RGB"))
    brightness = sum(stat.mean) / (3 * 255)
    if brightness < 0.12:
        issues.append("Image too dark — photograph in natural daylight")
        scores.append(0.2)
    elif brightness > 0.95:
        issues.append("Image overexposed — avoid direct flash")
        scores.append(0.4)
    else:
        scores.append(max(0.4, min(1.0, 1.0 - abs(brightness - 0.5) * 1.6)))

    # Contrast
    contrast_score = min(1.0, max(0.0, sum(stat.stddev) / (3 * 80)))
    scores.append(contrast_score)
    if contrast_score < 0.2:
        issues.append("Low contrast — ensure leaf fills the frame")

    final = sum(scores) / len(scores)
    passed = final >= settings.photo_quality_threshold and len(issues) < 3
    suggestion = ("" if passed else
                  "Photograph the most symptomatic leaf in direct daylight, "
                  "20–30 cm from your phone camera, holding it steady.")
    return PhotoQuality(score=round(final, 3), passed=passed, issues=issues, suggestion=suggestion)


# ── Label → slug mappings ──────────────────────────────────────────────────────

TOMATO_LABEL_TO_SLUG: dict[str, str | None] = {
    "A healthy tomato leaf": "tomato_healthy",
    "A tomato leaf with Leaf Mold": "tomato_leaf_mold",
    "A tomato leaf with Target Spot": "tomato_target_spot",
    "A tomato leaf with Late Blight": "tomato_late_blight",
    "A tomato leaf with Early Blight": "tomato_early_blight",
    "A tomato leaf with Bacterial Spot": "tomato_bacterial_spot",
    "A tomato leaf with Septoria Leaf Spot": "tomato_septoria_leaf_spot",
    "A tomato leaf with Spider Mites Two-spotted Spider Mite": "tomato_spider_mites",
    "A tomato leaf with Tomato Yellow Leaf Curl Virus": "tomato_yellow_leaf_curl_virus",
    "Healthy": "tomato_healthy", "healthy": "tomato_healthy",
    "Leaf Mold": "tomato_leaf_mold", "Target Spot": "tomato_target_spot",
    "Late Blight": "tomato_late_blight", "Early Blight": "tomato_early_blight",
    "Bacterial Spot": "tomato_bacterial_spot", "Septoria Leaf Spot": "tomato_septoria_leaf_spot",
    "Spider Mites Two-spotted Spider Mite": "tomato_spider_mites",
    "Tomato Yellow Leaf Curl Virus": "tomato_yellow_leaf_curl_virus",
    "Tomato Mosaic Virus": None,
}

MAIZE_LABEL_TO_SLUG: dict[str, str | None] = {
    "Blight": "maize_northern_leaf_blight", "blight": "maize_northern_leaf_blight",
    "Corn_Leaf_Blight": "maize_northern_leaf_blight",
    "Common_Rust": None, "Common Rust": None, "Gray_Leaf_Spot": None,
    "Gray Leaf Spot": None, "Healthy": None, "healthy": None,
    "Corn_Healthy": None, "Invalid": None,
}

# prithivMLmods/Rice-Leaf-Disease — verified from model card classification report
RICE_LABEL_TO_SLUG: dict[str, str | None] = {
    "Bacterialblight": "rice_bacterial_blight",
    "Bacterial Blight": "rice_bacterial_blight",
    "bacterial_blight": "rice_bacterial_blight",
    "Blast": "rice_blast", "blast": "rice_blast",
    "Brownspot": "rice_brown_spot", "Brown Spot": "rice_brown_spot",
    "brown_spot": "rice_brown_spot",
    "Healthy": "rice_healthy", "healthy": "rice_healthy",
    "Tungro": "rice_tungro", "tungro": "rice_tungro",
}


# ── Download helpers ───────────────────────────────────────────────────────────

def _snapshot(repo_id: str, local_dir, ignore: list[str] | None = None) -> bool:
    try:
        from huggingface_hub import snapshot_download
        from pathlib import Path
        Path(local_dir).mkdir(parents=True, exist_ok=True)
        snapshot_download(repo_id=repo_id, local_dir=str(local_dir),
                          token=settings.huggingface_token or None,
                          ignore_patterns=ignore or [])
        return True
    except Exception as exc:
        logger.error("Download failed %s: %s", repo_id, exc)
        return False


def download_tomato_model() -> bool:
    if settings.tomato_model_ready:
        return True
    logger.info("Downloading tomato ViT (~350MB)…")
    return _snapshot(settings.tomato_model_id, settings.tomato_model_path,
                     ["*.msgpack", "*.h5", "flax_model*", "tf_model*", "rust_model*"])


def download_maize_model() -> bool:
    if settings.maize_model_ready:
        return True
    logger.info("Downloading maize TF model (~25MB)…")
    return _snapshot(settings.maize_model_id, settings.maize_model_path)


def download_rice_model() -> bool:
    if settings.rice_model_ready:
        return True
    logger.info("Downloading rice SigLIP2 (~93MB)…")
    return _snapshot(settings.rice_model_id, settings.rice_model_path,
                     ["*.msgpack", "*.h5", "flax_model*", "tf_model*"])


# ── Model loaders ──────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_tomato_model():
    if not settings.tomato_model_ready:
        return None, None
    try:
        from transformers import AutoImageProcessor, AutoModelForImageClassification
        path = str(settings.tomato_model_path)
        processor = AutoImageProcessor.from_pretrained(path, local_files_only=True)
        model = AutoModelForImageClassification.from_pretrained(path, local_files_only=True)
        model.eval()
        logger.info("Tomato ViT ready — %d classes", model.config.num_labels)
        return processor, model
    except Exception as exc:
        logger.error("Tomato load failed: %s", exc)
        return None, None


@lru_cache(maxsize=1)
def _load_maize_model():
    if not settings.maize_model_ready:
        return None, None
    try:
        import tensorflow as tf
        path = str(settings.maize_model_path)
        model = tf.saved_model.load(path)
        classes_file = settings.maize_model_path / "classes.json"
        if classes_file.exists():
            raw = json.load(open(classes_file))
            if isinstance(raw, dict) and all(isinstance(v, int) for v in raw.values()):
                idx_to_label = {v: k for k, v in raw.items()}
            else:
                idx_to_label = {int(k): v for k, v in raw.items()} if isinstance(raw, dict) \
                    else {i: n for i, n in enumerate(raw)}
        else:
            idx_to_label = {0: "Blight", 1: "Common_Rust", 2: "Gray_Leaf_Spot", 3: "Healthy"}
        logger.info("Maize TF ready — %s", idx_to_label)
        return model, idx_to_label
    except Exception as exc:
        logger.error("Maize load failed: %s", exc)
        return None, None


@lru_cache(maxsize=1)
def _load_rice_model():
    if not settings.rice_model_ready:
        return None, None
    try:
        from transformers import AutoImageProcessor, AutoModelForImageClassification
        path = str(settings.rice_model_path)
        processor = AutoImageProcessor.from_pretrained(path, local_files_only=True)
        model = AutoModelForImageClassification.from_pretrained(path, local_files_only=True)
        model.eval()
        logger.info("Rice SigLIP2 ready — %d classes: %s",
                    model.config.num_labels, list(model.config.id2label.values()))
        return processor, model
    except Exception as exc:
        logger.error("Rice load failed: %s", exc)
        return None, None


# ── Inference runners ──────────────────────────────────────────────────────────

def _run_torch_model(img: Image.Image, processor, model) -> tuple[str, float]:
    import torch
    import torch.nn.functional as F
    inputs = processor(images=img, return_tensors="pt")
    with torch.no_grad():
        probs = F.softmax(model(**inputs).logits, dim=-1)[0]
    top_prob, top_idx = probs.max(dim=0)
    label = model.config.id2label[top_idx.item()]
    confidence = float(top_prob.item())
    top3 = [(model.config.id2label[i.item()], round(float(p.item()), 3))
            for p, i in zip(*torch.topk(probs, k=min(3, len(probs))))]
    logger.info("PyTorch top-3: %s", top3)
    return label, confidence


def _run_maize_tf(img: Image.Image, model, idx_to_label: dict) -> tuple[str, float]:
    import tensorflow as tf
    w, h = img.size
    resized = img.resize((300, 300 * h // w), Image.LANCZOS)
    arr = np.array(resized, dtype=np.float32)[None]
    pred = model(tf.constant(arr))
    pred_arr = (pred[0] if not isinstance(pred, dict) else list(pred.values())[0][0]).numpy()
    idx = int(pred_arr.argmax())
    exp = np.exp(pred_arr - pred_arr.max())
    probs = exp / exp.sum()
    label = idx_to_label.get(idx, f"class_{idx}")
    logger.info("Maize TF top-3: %s",
                [(idx_to_label.get(int(i), f"c{i}"), round(float(probs[i]), 3))
                 for i in pred_arr.argsort()[::-1][:3]])
    return label, float(probs[idx])


# ── Slug resolution ────────────────────────────────────────────────────────────

def _resolve_slug(label: str, crop: str) -> str | None:
    mapping = {"tomato": TOMATO_LABEL_TO_SLUG, "maize": MAIZE_LABEL_TO_SLUG,
               "rice": RICE_LABEL_TO_SLUG}.get(crop, {})
    if label in mapping:
        return mapping[label]
    lower = label.lower().strip()
    for k, v in mapping.items():
        if k.lower().strip() == lower:
            return v
    from app.services.treatment import list_slugs_for_crop
    for slug in list_slugs_for_crop(crop):
        part = slug.replace(f"{crop}_", "").replace("_", " ").lower()
        if part in lower or lower in part:
            return slug
    logger.warning("No slug for label='%s' crop='%s'", label, crop)
    return None


# ── Image load ────────────────────────────────────────────────────────────────

def _load_image(image_bytes: bytes) -> Image.Image:
    try:
        Image.open(BytesIO(image_bytes)).verify()
    except Exception as exc:
        raise ValueError(f"Corrupt or unreadable image: {exc}") from exc
    img = Image.open(BytesIO(image_bytes))
    return img.convert("RGB") if img.mode != "RGB" else img


# ── Model status ───────────────────────────────────────────────────────────────

def get_model_status() -> dict:
    return {
        "tomato_model_downloaded": settings.tomato_model_ready,
        "tomato_model_id": settings.tomato_model_id,
        "maize_model_downloaded": settings.maize_model_ready,
        "maize_model_id": settings.maize_model_id,
        "rice_model_downloaded": settings.rice_model_ready,
        "rice_model_id": settings.rice_model_id,
        "tomato_model_path": str(settings.tomato_model_path),
        "maize_model_path": str(settings.maize_model_path),
        "rice_model_path": str(settings.rice_model_path),
    }


# ── Public entry point ─────────────────────────────────────────────────────────

COMING_SOON_CROPS = {"cassava", "yam", "groundnut", "sorghum", "cowpea", "plantain"}


async def classify_image(image_bytes: bytes, crop: str) -> VisionResult:
    """
    Classify crop disease image via local model.
    Never raises — all failures captured in VisionResult.

    Error taxonomy:
      error set  + low_confidence=False → infrastructure failure (red card)
      error=None + low_confidence=True  → image quality / confidence issue (amber card)
      slug set   + low_confidence=False → successful diagnosis (green card)
    """
    t0 = time.monotonic()

    def _ms() -> int:
        return int((time.monotonic() - t0) * 1000)

    def _hard_error(msg: str, model: str = "none") -> VisionResult:
        return VisionResult(slug=None, label="", confidence=0.0,
                            model_used=model, inference_ms=_ms(),
                            low_confidence=False, error=msg)

    if crop in COMING_SOON_CROPS:
        return VisionResult(
            slug=None, label=f"{crop}_no_model", confidence=0.0,
            model_used="none", inference_ms=_ms(), low_confidence=False,
            error=(f"{crop.capitalize()} diagnosis is coming soon. "
                   "Please consult your nearest agricultural extension officer."),
        )

    try:
        img = _load_image(image_bytes)
    except Exception as exc:
        return _hard_error(f"Image could not be read: {exc}")

    quality = assess_photo_quality(img)

    if not quality.passed:
        return VisionResult(
            slug=None, label="photo_quality_fail", confidence=0.0,
            model_used="quality_checker", inference_ms=_ms(),
            low_confidence=True, error=None,
            severity_score=None, photo_quality=quality,
        )

    raw_label = ""
    confidence = 0.0
    model_name = ""

    if crop == "tomato":
        model_name = settings.tomato_model_id
        if not settings.tomato_model_ready:
            return _hard_error("Tomato model not yet downloaded.", model_name)
        try:
            processor, model = _load_tomato_model()
            if processor is None:
                return _hard_error("Tomato model failed to load.", model_name)
            raw_label, confidence = _run_torch_model(img, processor, model)
        except Exception as exc:
            return _hard_error(f"Tomato inference failed: {exc}", model_name)

    elif crop == "maize":
        model_name = settings.maize_model_id
        if not settings.maize_model_ready:
            return _hard_error("Maize model not yet downloaded.", model_name)
        try:
            tf_model, idx_to_label = _load_maize_model()
            if tf_model is None:
                return _hard_error("Maize model failed to load.", model_name)
            raw_label, confidence = _run_maize_tf(img, tf_model, idx_to_label)
        except Exception as exc:
            return _hard_error(f"Maize inference failed: {exc}", model_name)

    elif crop == "rice":
        model_name = settings.rice_model_id
        if not settings.rice_model_ready:
            return _hard_error("Rice model not yet downloaded.", model_name)
        try:
            processor, model = _load_rice_model()
            if processor is None:
                return _hard_error("Rice model failed to load.", model_name)
            raw_label, confidence = _run_torch_model(img, processor, model)
        except Exception as exc:
            return _hard_error(f"Rice inference failed: {exc}", model_name)

    else:
        return _hard_error(f"Unsupported crop: '{crop}'.")

    logger.info("Inference: crop=%s label='%s' conf=%.3f ms=%d", crop, raw_label, confidence, _ms())

    slug = _resolve_slug(raw_label, crop)

    # Confidence threshold
    thresholds = {"tomato": settings.tomato_confidence_threshold,
                  "maize": settings.maize_confidence_threshold,
                  "rice": settings.rice_confidence_threshold}
    threshold = thresholds.get(crop, 0.55)
    if slug:
        from app.services.treatment import get_confidence_threshold
        threshold = get_confidence_threshold(slug)

    low_conf = confidence < threshold or slug is None

    severity = compute_severity_score(slug, confidence) if (slug and not low_conf) else None

    logger.info("Result: slug=%s conf=%.3f low_conf=%s severity=%s ms=%d",
                slug, confidence, low_conf, severity, _ms())

    return VisionResult(
        slug=slug if not low_conf else None,
        label=raw_label, confidence=confidence,
        model_used=model_name, inference_ms=_ms(),
        low_confidence=low_conf, error=None,
        severity_score=severity, photo_quality=quality,
    )
