"""
Smart Car Rental — Financial Service
FastAPI Application

Responsibilities:
  - Receive webhook when AI damage report is completed
  - Apply the appropriate deposit Strategy
  - Create Transaction records in Supabase
  - Trigger payment gateway for refunds/deductions
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from supabase import create_client, Client

from deposit_strategies import select_strategy, DepositOutcome

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─── Settings ─────────────────────────────────────────────────────────────────

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    financial_service_secret: str = ""
    payment_gateway_api_key: str = ""
    payment_gateway_base_url: str = "https://api.paymob.com/api"

    class Config:
        env_file = ".env"

settings = Settings()

_supabase: Client | None = None

def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _supabase


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Smart Car Rental — Financial Service",
    version="1.0.0",
    description="Deposit Strategy & Payment Processing Microservice",
)


# ─── Schemas ──────────────────────────────────────────────────────────────────

class RentalCompletionWebhook(BaseModel):
    """Fired by Supabase webhook when ai_damage_reports status → 'completed'."""
    rental_id:             str
    vehicle_id:            str
    renter_id:             str
    owner_id:              str
    security_deposit:      float
    estimated_repair_cost: float
    severity:              str    # none | minor | moderate | severe


class ManualSettlementRequest(BaseModel):
    rental_id: str
    override_severity: str | None = None


class HealthResponse(BaseModel):
    status: str
    timestamp: str


# ─── Auth ─────────────────────────────────────────────────────────────────────

def _verify_secret(secret: str | None):
    if settings.financial_service_secret and secret != settings.financial_service_secret:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", timestamp=datetime.now(timezone.utc).isoformat())


@app.post("/settle-deposit")
async def settle_deposit(
    body: RentalCompletionWebhook,
    background_tasks: BackgroundTasks,
    x_webhook_secret: str | None = Header(default=None),
):
    """
    Webhook called when the AI damage report is completed.
    Applies deposit strategy and initiates transactions.
    """
    _verify_secret(x_webhook_secret)
    background_tasks.add_task(_process_settlement, body)
    return {"status": "accepted", "rental_id": body.rental_id}


@app.post("/settle-deposit/manual")
async def manual_settle(
    body: ManualSettlementRequest,
    x_webhook_secret: str | None = Header(default=None),
):
    """Admin endpoint: manually trigger settlement for a rental."""
    _verify_secret(x_webhook_secret)
    supabase = get_supabase()

    rental = supabase.table("rentals").select("*, ai_damage_reports(*)").eq(
        "id", body.rental_id
    ).single().execute()

    if not rental.data:
        raise HTTPException(404, "Rental not found")

    r = rental.data
    report = r.get("ai_damage_reports", [{}])
    report = report[0] if isinstance(report, list) and report else {}

    severity = body.override_severity or report.get("severity", "none")
    cost     = report.get("estimated_cost_egp", 0)

    payload = RentalCompletionWebhook(
        rental_id             = body.rental_id,
        vehicle_id            = r["vehicle_id"],
        renter_id             = r["renter_id"],
        owner_id              = r["owner_id"],
        security_deposit      = r["security_deposit"],
        estimated_repair_cost = cost,
        severity              = severity,
    )
    await _process_settlement(payload)
    return {"status": "settled", "rental_id": body.rental_id}


# ─── Core Settlement Logic ────────────────────────────────────────────────────

async def _process_settlement(body: RentalCompletionWebhook):
    supabase = get_supabase()
    try:
        # 1. Select strategy
        strategy = select_strategy(body.severity)
        outcome: DepositOutcome = strategy.calculate(
            deposit_amount        = body.security_deposit,
            estimated_repair_cost = body.estimated_repair_cost,
            severity              = body.severity,
        )
        logger.info(
            f"Settlement | rental={body.rental_id} | "
            f"strategy={outcome.status} | "
            f"deduction={outcome.deduction} | refund={outcome.refund_amount}"
        )

        # 2. Update rental record
        supabase.table("rentals").update({
            "deposit_status":    outcome.status.value,
            "deposit_deduction": outcome.deduction,
            "status":            "completed",
            "updated_at":        datetime.now(timezone.utc).isoformat(),
        }).eq("id", body.rental_id).execute()

        # 3. Create transaction records
        _create_transaction(supabase, body, "deposit_deduction", outcome.deduction)
        if outcome.refund_amount > 0:
            _create_transaction(supabase, body, "deposit_refund", outcome.refund_amount)

        # 4. Update vehicle status back to available
        supabase.table("vehicles").update({
            "status": "available"
        }).eq("id", body.vehicle_id).execute()

        # 5. Trigger payment gateway (stub — wire up Paymob or similar)
        await _trigger_payment_gateway(body, outcome)

    except Exception as exc:
        logger.exception(f"Settlement failed for rental {body.rental_id}: {exc}")


def _create_transaction(
    supabase: Client,
    body: RentalCompletionWebhook,
    tx_type: str,
    amount: float,
):
    if amount <= 0:
        return
    supabase.table("transactions").insert({
        "rental_id":   body.rental_id,
        "payer_id":    body.renter_id  if tx_type == "deposit_deduction" else None,
        "payee_id":    body.owner_id   if tx_type == "deposit_deduction" else body.renter_id,
        "type":        tx_type,
        "amount_egp":  amount,
        "status":      "pending",
        "created_at":  datetime.now(timezone.utc).isoformat(),
    }).execute()


async def _trigger_payment_gateway(body: RentalCompletionWebhook, outcome: DepositOutcome):
    """
    Stub — wire up your payment gateway (e.g., Paymob, Fawry) here.
    This function should:
      1. Capture the held deposit charge
      2. Refund outcome.refund_amount to the renter's payment method
    """
    logger.info(
        f"[PAYMENT STUB] Would process: "
        f"capture={outcome.deduction} EGP | "
        f"refund={outcome.refund_amount} EGP | "
        f"rental={body.rental_id}"
    )
    # TODO: Implement actual payment gateway calls
