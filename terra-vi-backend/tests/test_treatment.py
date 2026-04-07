"""
Unit tests for the treatment lookup service.
These tests run without any API keys or database — pure Python.

Run with:
    cd backend
    pytest tests/test_treatment.py -v
"""

import pytest

from app.services.treatment import (
    get_confidence_threshold,
    get_low_confidence_message,
    get_meta,
    get_treatment,
    get_visual_markers,
    list_slugs_for_crop,
)

# All slugs that must exist in treatments.json
EXPECTED_SLUGS = [
    "tomato_early_blight",
    "tomato_late_blight",
    "tomato_leaf_miner",
    "cassava_mosaic_disease",
    "cassava_bacterial_blight",
    "maize_fall_armyworm",
    "maize_northern_leaf_blight",
]


class TestTreatmentLoading:
    def test_all_expected_slugs_present(self):
        for slug in EXPECTED_SLUGS:
            entry = get_treatment(slug)
            assert entry is not None, f"Missing slug: {slug}"

    def test_unknown_slug_returns_none(self):
        assert get_treatment("banana_mystery_disease") is None

    def test_meta_loads(self):
        meta = get_meta()
        assert "version" in meta
        assert "crops_covered" in meta

    def test_low_confidence_message_is_string(self):
        msg = get_low_confidence_message()
        assert isinstance(msg, str)
        assert len(msg) > 20


class TestCropListing:
    def test_tomato_slugs(self):
        slugs = list_slugs_for_crop("tomato")
        assert "tomato_early_blight" in slugs
        assert "tomato_late_blight" in slugs
        assert "tomato_leaf_miner" in slugs
        # Should NOT include cassava or maize entries
        assert all(s.startswith("tomato") for s in slugs)

    def test_cassava_slugs(self):
        slugs = list_slugs_for_crop("cassava")
        assert "cassava_mosaic_disease" in slugs
        assert "cassava_bacterial_blight" in slugs
        assert all(s.startswith("cassava") for s in slugs)

    def test_maize_slugs(self):
        slugs = list_slugs_for_crop("maize")
        assert "maize_fall_armyworm" in slugs
        assert "maize_northern_leaf_blight" in slugs
        assert all(s.startswith("maize") for s in slugs)

    def test_unknown_crop_returns_empty(self):
        assert list_slugs_for_crop("yam") == []


class TestEntryStructure:
    @pytest.mark.parametrize("slug", EXPECTED_SLUGS)
    def test_required_fields_present(self, slug):
        entry = get_treatment(slug)
        required = [
            "id", "crop", "disease_name", "local_name",
            "pathogen", "type", "visual_markers", "severity",
            "organic_treatment", "chemical_treatment", "prevention",
            "when_to_seek_extension_officer",
        ]
        for field in required:
            assert field in entry, f"slug={slug} missing field: {field}"

    @pytest.mark.parametrize("slug", EXPECTED_SLUGS)
    def test_visual_markers_non_empty(self, slug):
        markers = get_visual_markers(slug)
        assert isinstance(markers, list)
        assert len(markers) >= 3, f"slug={slug} has too few visual markers"

    @pytest.mark.parametrize("slug", EXPECTED_SLUGS)
    def test_confidence_threshold_in_range(self, slug):
        threshold = get_confidence_threshold(slug)
        assert 0.0 <= threshold <= 1.0, f"slug={slug} threshold out of range: {threshold}"

    @pytest.mark.parametrize("slug", EXPECTED_SLUGS)
    def test_severity_has_three_levels(self, slug):
        entry = get_treatment(slug)
        severity = entry["severity"]
        assert "mild" in severity
        assert "moderate" in severity
        assert "severe" in severity

    @pytest.mark.parametrize("slug", EXPECTED_SLUGS)
    def test_prevention_is_list(self, slug):
        entry = get_treatment(slug)
        assert isinstance(entry["prevention"], list)
        assert len(entry["prevention"]) >= 3


class TestViralSpecialCase:
    def test_cassava_mosaic_has_critical_note(self):
        """CMD is a viral disease with no chemical cure — must have critical_note."""
        entry = get_treatment("cassava_mosaic_disease")
        assert "critical_note" in entry
        assert entry["critical_note"] is not None
        assert "no chemical cure" in entry["critical_note"].lower() or "no" in entry["critical_note"].lower()

    def test_cassava_mosaic_has_resistant_varieties(self):
        entry = get_treatment("cassava_mosaic_disease")
        assert "resistant_varieties" in entry
        assert entry["resistant_varieties"] is not None
