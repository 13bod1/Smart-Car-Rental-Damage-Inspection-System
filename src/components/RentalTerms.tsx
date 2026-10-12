"use client";

import { useState } from "react";

export function RentalTerms() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card mt-8" style={{ border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center"
        style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "0.5rem 0" }}
      >
        <h3 style={{ margin: 0 }}>📜 Important Rental Terms & Rules</h3>
        <span style={{ fontSize: "1.5rem", transition: "transform 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-6 text-sm text-secondary" style={{ lineHeight: "1.6" }}>
          <h4 className="text-primary mb-2">Driver & Licence Requirements</h4>
          <ul className="mb-4 list-disc pl-5">
            <li><strong>When you pick the car up, you'll need:</strong> Passport or national ID card, Driving licence, Credit card.</li>
            <li><strong>Age Requirements:</strong> To drive this car, you must be at least 21 and under the age of 70.</li>
            <li><strong>Licence Rules:</strong> Digital driving licences will not be accepted. All drivers must have held their driving licence for at least 12 months. Foreign renters are required to have an International Driving Permit. Your ID/passport and driving license needs to have been issued by the same country.</li>
            <li><strong>Additional drivers:</strong> The main driver must be present. There may be a daily fee for additional drivers.</li>
          </ul>

          <h4 className="text-primary mb-2">Security Deposit & Accepted Cards</h4>
          <ul className="mb-4 list-disc pl-5">
            <li><strong>Deposit:</strong> At pick-up, the main driver will leave a refundable security deposit of €570.00 on their credit card. Cash and debit cards are not accepted. The counter staff will confirm how much this will be.</li>
            <li><strong>Accepted cards:</strong> MasterCard and Visa. Cards distributed by neobanks (online-only banks) are not accepted. Prepaid, recharge or virtual cards are not accepted. The card must have a chip, be activated for international transactions, and have the full name and 16-digit number visible. You'll need your PIN.</li>
          </ul>

          <h4 className="text-primary mb-2">Insurance, Covers and Waivers</h4>
          <ul className="mb-4 list-disc pl-5">
            <li><strong>Collision Damage Waiver (CDW):</strong> Damage excess is €570.00. This doesn’t cover parts like glass, wheels, interior, roof, undercarriage, towing, or personal belongings. Not included: keys, aerials, jack, safety triangles, petrol cap.</li>
            <li><strong>Theft Cover:</strong> Excess is €570.00.</li>
            <li><strong>Third-Party Liability (TPL):</strong> Covers injuries and property damage to third parties.</li>
            <li><strong>Loss or Damage:</strong> Contact the rental company and police immediately in case of severe damage or theft. A police report is required. Damage will incur an Administration fee on top of the amount deducted from the excess. An Immobilisation Charge is also payable in the event of an accident.</li>
          </ul>

          <h4 className="text-primary mb-2">Mileage & Travel Restrictions</h4>
          <ul className="mb-4 list-disc pl-5">
            <li><strong>Mileage:</strong> 450 kilometres per rental (or 150 free km per day). Extra km cost between €0.25 and €0.95 each.</li>
            <li><strong>Cross border:</strong> Cross-border travel is NOT allowed with this car hire company.</li>
            <li><strong>Road rules:</strong> No driving under influence, no toxic/dangerous goods, no off-road/unpaved driving, no towing, no rallies. Non-smoking policy applies.</li>
          </ul>

          <h4 className="text-primary mb-2">Pick-up, Drop-off & Fuel</h4>
          <ul className="mb-4 list-disc pl-5">
            <li><strong>Fuel policy (Like for like):</strong> Pick up full/partly full, return with the same amount. Missing fuel will be charged from the deposit at supplier's rates. Use the correct fuel type to avoid misfuelling charges.</li>
            <li><strong>E-cars:</strong> Check charging port/cables for damage before driving off.</li>
            <li><strong>Grace period & Late fees:</strong> 59-minute grace period for returns. Late returns invalidate insurance and incur a late penalty fee + daily rate. For pick-ups, reservations are held for 60 minutes only.</li>
            <li><strong>Out of Hours:</strong> Available on request for a €20.00 fee. No delivery/collection services.</li>
          </ul>

          <h4 className="text-primary mb-2">Company Registration Details</h4>
          <p className="mb-4 p-3 rounded bg-surface">
            Egywheels, 24 el sheed moustafa riad st of el badrawy abbass Cairo 00000 EG, 682247952.
          </p>

          <p className="text-xs text-muted mt-6 italic">
            Please see the Service Provider’s full terms and conditions at the counter. By making this booking, you’re confirming that you have read and accept the rental terms. The rental company reserves the right to refuse a car if the driver is unfit or documentation requirements are not met.
          </p>
        </div>
      )}
    </div>
  );
}
