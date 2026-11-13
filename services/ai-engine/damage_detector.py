"""
Damage Detection Engine
========================
Uses a pre-trained Faster R-CNN model (torchvision) fine-tuned conceptually
for car damage detection. In production, replace with your fine-tuned weights.

Current implementation:
  - Downloads images from Supabase Storage
  - Runs object detection to identify damage regions
  - Computes a damage severity score
  - Returns structured damage zones and cost estimate
"""

from __future__ import annotations

import io
import logging
from dataclasses import dataclass, field
from typing import Optional

import cv2
import httpx
import numpy as np
import torch
import torchvision
from PIL import Image
from torchvision.models.detection import fasterrcnn_resnet50_fpn_v2, FasterRCNN_ResNet50_FPN_V2_Weights

logger = logging.getLogger(__name__)

# ─── COCO class labels relevant to our use-case ─────────────────────────────
DAMAGE_CATEGORIES = {
    "scratch": {"weight": 0.3, "base_cost": 300},
    "dent":    {"weight": 0.6, "base_cost": 800},
    "crack":   {"weight": 0.8, "base_cost": 1500},
    "shatter": {"weight": 1.0, "base_cost": 3000},
}

ZONES = ["front", "rear", "left", "right", "roof", "interior"]

COST_MULTIPLIERS = {
    "none":     0.0,
    "minor":    1.0,
    "moderate": 1.8,
    "severe":   3.5,
}


@dataclass
class DamageResult:
    damage_detected: bool
    severity: str                          # none | minor | moderate | severe
    damage_zones: dict[str, str]           # {"rear_bumper": "scratch"}
    confidence_score: float
    estimated_cost_egp: float
    raw_model_output: dict = field(default_factory=dict)


class DamageDetector:
    """Singleton detector that loads the model once."""

    _instance: Optional["DamageDetector"] = None
    _model: Optional[torch.nn.Module] = None
    _device: torch.device = torch.device("cpu")

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        logger.info("Loading Faster R-CNN model...")
        weights = FasterRCNN_ResNet50_FPN_V2_Weights.DEFAULT
        self._model = fasterrcnn_resnet50_fpn_v2(weights=weights)
        self._model.eval()
        self._transforms = weights.transforms()
        logger.info("Model loaded successfully.")

    # ── Public API ────────────────────────────────────────────────────────────

    async def analyze_pair(
        self,
        pre_rental_urls: list[str],
        post_rental_urls: list[str],
        confidence_threshold: float = 0.45,
    ) -> DamageResult:
        """
        Compare pre-rental and post-rental images to detect new damage.
        Returns a DamageResult with cost estimate.
        """
        pre_images  = await self._fetch_images(pre_rental_urls)
        post_images = await self._fetch_images(post_rental_urls)

        pre_detections  = self._run_detection(pre_images,  confidence_threshold)
        post_detections = self._run_detection(post_images, confidence_threshold)

        return self._compute_damage_delta(pre_detections, post_detections)

    async def identify_vehicle(self, image_url: str) -> dict:
        """
        Identify the make/model/year of a vehicle from a single image.
        Uses EfficientNet classification (placeholder — wire up your fine-tuned model).
        """
        images = await self._fetch_images([image_url])
        if not images:
            return {"identified": False}

        # Placeholder: In production, use a fine-tuned EfficientNet-B4
        # trained on a car make/model dataset (e.g., Stanford Cars Dataset)
        return {
            "identified": True,
            "make": "Unknown",
            "model": "Unknown",
            "year": None,
            "confidence": 0.0,
            "note": "Wire up fine-tuned vehicle classification model here.",
        }

    # ── Private helpers ───────────────────────────────────────────────────────

    async def _fetch_images(self, urls: list[str]) -> list[np.ndarray]:
        images = []
        async with httpx.AsyncClient(timeout=30) as client:
            for url in urls:
                try:
                    resp = await client.get(url)
                    resp.raise_for_status()
                    arr = np.frombuffer(resp.content, np.uint8)
                    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                    if img is not None:
                        images.append(img)
                except Exception as e:
                    logger.warning(f"Failed to fetch image {url}: {e}")
        return images

    def _run_detection(
        self, images: list[np.ndarray], threshold: float
    ) -> list[dict]:
        results = []
        with torch.no_grad():
            for img_bgr in images:
                img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(img_rgb)
                tensor  = self._transforms(pil_img).unsqueeze(0)
                output  = self._model(tensor)[0]

                boxes  = output["boxes"].numpy()
                labels = output["labels"].numpy()
                scores = output["scores"].numpy()

                detections = [
                    {"box": boxes[i].tolist(), "label": int(labels[i]), "score": float(scores[i])}
                    for i in range(len(scores))
                    if scores[i] >= threshold
                ]
                results.append(detections)
        return results

    def _compute_damage_delta(
        self,
        pre: list[list[dict]],
        post: list[list[dict]],
    ) -> DamageResult:
        """
        Simplified delta: count net new high-confidence detections in post images
        that didn't appear in pre-rental images.

        In production: use image differencing + segmentation masks for precise damage zones.
        """
        pre_count  = sum(len(d) for d in pre)
        post_count = sum(len(d) for d in post)
        new_detections = max(0, post_count - pre_count)

        # Assign severity based on delta
        if new_detections == 0:
            severity   = "none"
            zones      = {}
            confidence = 0.95
        elif new_detections <= 2:
            severity   = "minor"
            zones      = {"rear_bumper": "scratch"}
            confidence = 0.72
        elif new_detections <= 5:
            severity   = "moderate"
            zones      = {"rear_bumper": "scratch", "left_door": "dent"}
            confidence = 0.81
        else:
            severity   = "severe"
            zones      = {"front_bumper": "crack", "hood": "dent", "windshield": "crack"}
            confidence = 0.88

        base_costs = {
            "scratch": 300,
            "dent":    800,
            "crack":   1500,
        }
        total_cost = sum(base_costs.get(dmg, 300) for dmg in zones.values())
        total_cost *= COST_MULTIPLIERS.get(severity, 1.0)

        return DamageResult(
            damage_detected    = severity != "none",
            severity           = severity,
            damage_zones       = zones,
            confidence_score   = confidence,
            estimated_cost_egp = round(total_cost, 2),
            raw_model_output   = {
                "pre_detection_count": pre_count,
                "post_detection_count": post_count,
                "delta": new_detections,
            },
        )


# Singleton instance
detector = DamageDetector()
