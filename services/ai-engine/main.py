"""
Smart Car Rental — AI Engine
FastAPI Application
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel

from config import settings
from damage_detector import detector
from database import get_supabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Car Rental — AI Engine",
    version="1.0.0",
    description="AI Damage Assessment & Vehicle Valuation Microservice",
)


# ─── Request / Response Schemas ───────────────────────────────────────────────

class DamageAnalysisRequest(BaseModel):
    rental_id: str
    vehicle_id: str
    pre_rental_image_urls: list[str]
    post_rental_image_urls: list[str]


class ValuationRequest(BaseModel):
    image_url: str
    session_id: str | None = None
    user_id: str | None = None


class HealthResponse(BaseModel):
    status: str
    timestamp: str


# ─── Auth guard ───────────────────────────────────────────────────────────────

def _verify_secret(x_webhook_secret: str | None):
    if settings.ai_engine_secret and x_webhook_secret != settings.ai_engine_secret:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", timestamp=datetime.now(timezone.utc).isoformat())


@app.post("/analyze-damage")
async def analyze_damage(
    body: DamageAnalysisRequest,
    background_tasks: BackgroundTasks,
    x_webhook_secret: str | None = Header(default=None),
):
    """
    Webhook endpoint called by Supabase when post-rental photos are uploaded.
    Runs damage analysis and writes the report back to Supabase PostgreSQL.
    """
    _verify_secret(x_webhook_secret)

    supabase = get_supabase()

    # Mark report as 'processing'
    supabase.table("ai_damage_reports").insert({
        "rental_id":  body.rental_id,
        "vehicle_id": body.vehicle_id,
        "status":     "processing",
    }).execute()

    background_tasks.add_task(
        _run_damage_analysis,
        body.rental_id,
        body.vehicle_id,
        body.pre_rental_image_urls,
        body.post_rental_image_urls,
    )

    return {"status": "accepted", "rental_id": body.rental_id}


async def _run_damage_analysis(
    rental_id: str,
    vehicle_id: str,
    pre_urls: list[str],
    post_urls: list[str],
):
    supabase = get_supabase()
    try:
        result = await detector.analyze_pair(
            pre_rental_urls=pre_urls,
            post_rental_urls=post_urls,
            confidence_threshold=settings.model_confidence_threshold,
        )

        # Determine deposit strategy
        if result.severity == "none":
            strategy = "full_refund"
        elif result.severity in ("minor", "moderate"):
            strategy = "partial_deduction"
        else:
            strategy = "full_confiscation"

        # Update damage report
        supabase.table("ai_damage_reports").update({
            "status":             "completed",
            "damage_detected":    result.damage_detected,
            "severity":           result.severity,
            "damage_zones":       result.damage_zones,
            "confidence_score":   result.confidence_score,
            "estimated_cost_egp": result.estimated_cost_egp,
            "strategy_applied":   strategy,
            "raw_model_output":   result.raw_model_output,
            "processed_at":       datetime.now(timezone.utc).isoformat(),
        }).eq("rental_id", rental_id).execute()

        # Update rental record with deduction
        supabase.table("rentals").update({
            "deposit_deduction": result.estimated_cost_egp,
            "deposit_status":    strategy.replace("_", "_"),  # keeps naming consistent
        }).eq("id", rental_id).execute()

        logger.info(
            f"Damage analysis complete | rental={rental_id} | "
            f"severity={result.severity} | cost={result.estimated_cost_egp} EGP"
        )

    except Exception as exc:
        logger.exception(f"Damage analysis failed for rental {rental_id}: {exc}")
        supabase.table("ai_damage_reports").update({
            "status": "failed",
        }).eq("rental_id", rental_id).execute()


@app.post("/identify-vehicle")
async def identify_vehicle(
    body: ValuationRequest,
    x_webhook_secret: str | None = Header(default=None),
):
    """
    Snap & Identify: identify make/model/year from a street photo,
    then look up current market value and rental rate from the DB.
    """
    _verify_secret(x_webhook_secret)

    supabase = get_supabase()

    # Run identification model
    identification = await detector.identify_vehicle(body.image_url)

    market_value = None
    daily_rate   = None

    if identification.get("identified") and identification.get("make") != "Unknown":
        resp = supabase.table("vehicle_market_values").select("*").eq(
            "make", identification["make"]
        ).eq(
            "model", identification["model"]
        ).eq(
            "year", identification["year"]
        ).maybe_single().execute()

        if resp.data:
            market_value = resp.data["market_value"]
            daily_rate   = resp.data["daily_rate"]

    # Persist valuation record
    record = {
        "image_url":         body.image_url,
        "identified_make":   identification.get("make"),
        "identified_model":  identification.get("model"),
        "identified_year":   identification.get("year"),
        "market_value_egp":  market_value,
        "daily_rate_egp":    daily_rate,
        "confidence_score":  identification.get("confidence", 0),
        "raw_output":        identification,
        "session_id":        body.session_id,
    }
    if body.user_id:
        record["requested_by"] = body.user_id

    supabase.table("valuations").insert(record).execute()

    return {
        "identified":    identification.get("identified"),
        "make":          identification.get("make"),
        "model":         identification.get("model"),
        "year":          identification.get("year"),
        "confidence":    identification.get("confidence"),
        "market_value":  market_value,
        "daily_rate":    daily_rate,
        "currency":      "EGP",
    }
