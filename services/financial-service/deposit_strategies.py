"""
Deposit Strategy Pattern
=========================
Each strategy encapsulates how the security deposit is handled
at the end of a rental, based on the AI damage assessment result.

Strategy classes implement a common interface: calculate(rental) -> DepositOutcome
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum


class DepositStatus(str, Enum):
    FULL_REFUND       = "full_refund"
    PARTIAL_DEDUCTION = "partial_deduction"
    CONFISCATED       = "full_confiscation"


@dataclass
class DepositOutcome:
    status:           DepositStatus
    amount_held:      float   # total deposit amount
    deduction:        float   # amount deducted for damage
    refund_amount:    float   # amount returned to renter
    description:      str


# ─── Base Strategy ────────────────────────────────────────────────────────────

class DepositStrategy(ABC):
    @abstractmethod
    def calculate(
        self,
        deposit_amount: float,
        estimated_repair_cost: float,
        severity: str,
    ) -> DepositOutcome:
        ...


# ─── Concrete Strategies ──────────────────────────────────────────────────────

class FullRefundStrategy(DepositStrategy):
    """No damage detected — return full deposit to renter."""

    def calculate(self, deposit_amount: float, estimated_repair_cost: float, severity: str) -> DepositOutcome:
        return DepositOutcome(
            status        = DepositStatus.FULL_REFUND,
            amount_held   = deposit_amount,
            deduction     = 0.0,
            refund_amount = deposit_amount,
            description   = "No damage detected. Full deposit refunded.",
        )


class PartialDeductionStrategy(DepositStrategy):
    """Minor or moderate damage — deduct repair cost, refund remainder."""

    def calculate(self, deposit_amount: float, estimated_repair_cost: float, severity: str) -> DepositOutcome:
        deduction     = min(estimated_repair_cost, deposit_amount)
        refund_amount = max(0.0, deposit_amount - deduction)
        return DepositOutcome(
            status        = DepositStatus.PARTIAL_DEDUCTION,
            amount_held   = deposit_amount,
            deduction     = round(deduction, 2),
            refund_amount = round(refund_amount, 2),
            description   = (
                f"{severity.capitalize()} damage detected. "
                f"Deducting {deduction:.2f} EGP for repairs; "
                f"refunding {refund_amount:.2f} EGP."
            ),
        )


class FullConfiscationStrategy(DepositStrategy):
    """Severe damage — retain entire deposit; owner may file additional claim."""

    def calculate(self, deposit_amount: float, estimated_repair_cost: float, severity: str) -> DepositOutcome:
        return DepositOutcome(
            status        = DepositStatus.CONFISCATED,
            amount_held   = deposit_amount,
            deduction     = deposit_amount,
            refund_amount = 0.0,
            description   = (
                f"Severe damage detected (estimated repair: {estimated_repair_cost:.2f} EGP). "
                f"Full deposit of {deposit_amount:.2f} EGP retained. "
                f"Additional claim may be filed if repair exceeds deposit."
            ),
        )


# ─── Strategy Selector (Factory) ─────────────────────────────────────────────

def select_strategy(severity: str) -> DepositStrategy:
    """
    Factory that selects the appropriate deposit strategy
    based on the AI severity classification.
    """
    mapping: dict[str, DepositStrategy] = {
        "none":     FullRefundStrategy(),
        "minor":    PartialDeductionStrategy(),
        "moderate": PartialDeductionStrategy(),
        "severe":   FullConfiscationStrategy(),
    }
    return mapping.get(severity, FullRefundStrategy())
