"use client";

import { useState } from "react";
import { Vehicle } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface CheckoutFormProps {
  vehicle: Vehicle;
  onSuccess: () => void;
}

const EXTRAS = [
  { id: "add_driver", name: "Additional driver", price: 685, desc: "If you want other people to drive as well" },
  { id: "child_seat", name: "Child seat", price: 685, desc: "For small children: 9-18 kg / 20-40 lbs (about 1-3 years old)" },
  { id: "gps", name: "GPS", price: 685, desc: "A satellite navigation (sat nav) device that provides directions" },
  { id: "baby_seat", name: "Baby seat", price: 685, desc: "For babies: up to 9 kg / 20 lbs (about 1 year old)" },
  { id: "booster", name: "Child booster seat", price: 685, desc: "For bigger children: 18-45 kg / 40-100 lbs (about 4-11 years old)" },
  { id: "snow_chains", name: "Snow chains", price: 15216, desc: "Fit onto your tyres to make it safer to drive in snowy conditions" },
];

export function CheckoutForm({ vehicle, onSuccess }: CheckoutFormProps) {
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [hasFullProtection, setHasFullProtection] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Visa / Mastercard");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Main driver credentials
  const [driverFirstName, setDriverFirstName] = useState("");
  const [driverLastName, setDriverLastName] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverCountry, setDriverCountry] = useState("Egypt");

  // Billing credentials
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingPostcode, setBillingPostcode] = useState("");

  // Payment credentials
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [walletPhone, setWalletPhone] = useState("");

  const updateExtra = (id: string, delta: number) => {
    setExtras(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const getDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = e.getTime() - s.getTime();
    return Math.max(0, diff / (1000 * 3600 * 24));
  };
  const days = getDays();
  const baseRent = days * vehicle.daily_rate;
  
  const extrasCost = Object.entries(extras).reduce((total, [id, qty]) => {
    const extra = EXTRAS.find(x => x.id === id);
    return total + (extra ? extra.price * qty : 0);
  }, 0);

  const protectionCost = hasFullProtection ? 3489.04 : 0;
  const deposit = vehicle.security_deposit;
  const totalCost = baseRent + extrasCost + protectionCost + deposit;

  // Format Card Number input with spaces (xxxx xxxx xxxx xxxx)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  // Format Expiry date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  const handleBook = async () => {
    setLoading(true);
    setErrorMsg("");

    // Validate credentials
    const isDriverEmpty = !driverFirstName.trim() || !driverLastName.trim() || !driverEmail.trim() || !driverPhone.trim();
    const isBillingEmpty = !billingAddress.trim() || !billingCity.trim() || !billingPostcode.trim();
    const isPaymentEmpty = paymentMethod === "Visa / Mastercard"
      ? (!cardNumber.trim() || !cardHolder.trim() || !expiry.trim() || !cvc.trim())
      : !walletPhone.trim();

    if (isDriverEmpty || isBillingEmpty || isPaymentEmpty) {
      setErrorMsg("⚠️ Please fill up the credentials.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/rentals/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          vehicleInfo: {
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            category: vehicle.category,
            daily_rate: vehicle.daily_rate,
            security_deposit: vehicle.security_deposit,
            plate_number: vehicle.plate_number,
            thumbnail_url: vehicle.thumbnail_url,
          },
          startDate,
          endDate,
          totalPrice: Math.round(totalCost),
          driverDetails: {
            firstName: driverFirstName,
            lastName: driverLastName,
            email: driverEmail,
            phone: driverPhone,
            city: billingCity,
            address: billingAddress,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Booking request failed.");
      }

      if (data.booking) {
        try {
          const existing = JSON.parse(localStorage.getItem("autorent_real_bookings") || "[]");
          const updated = [data.booking, ...existing.filter((b: any) => b.id !== data.booking.id)];
          localStorage.setItem("autorent_real_bookings", JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
        } catch {}
      }

      onSuccess();
    } catch (e: any) {
      setErrorMsg(e.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-2 animate-fade-in">
      <h3 className="mb-4">Reserve this Vehicle</h3>

      {/* STEP 1: Dates & Extras */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div className="p-3 mb-4 rounded bg-success-light text-success font-semibold text-sm">
            ✓ Free cancellation up to 48 hours before pick-up
          </div>
          <p className="text-sm text-secondary mb-4">
            Rental companies only allow you to get your keys at your allocated pick-up time, they&apos;ll usually hold your car for a limited time after you&apos;re due to pick it up - then it&apos;s likely to be passed to another customer.
            <br/><br/>
            <strong>Your pick-up time is 10:00 AM</strong>. At pick-up, the main driver will need € 1,000 available on their credit card for a refundable security deposit. Cash and debit cards aren&apos;t accepted.
          </p>

          <div className="grid-2 gap-4 mb-6">
            <div className="form-group">
              <label className="label">Pick-up Date</label>
              <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Drop-off Date</label>
              <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <hr className="my-6 border-border" />
          <h4 className="mb-4">Add extras, complete your trip</h4>
          <div className="flex flex-col gap-4 mb-6">
            {EXTRAS.map(ex => (
              <div key={ex.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-bold">{ex.name}</div>
                  <div className="text-sm text-primary font-semibold">EGP {ex.price.toLocaleString()} each per rental</div>
                  <div className="text-xs text-secondary mt-1">{ex.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="btn btn-secondary px-3 py-1" onClick={() => updateExtra(ex.id, -1)} disabled={!extras[ex.id]}>-</button>
                  <span className="font-bold min-w-[20px] text-center">{extras[ex.id] || 0}</span>
                  <button className="btn btn-secondary px-3 py-1" onClick={() => updateExtra(ex.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="btn btn-primary w-full py-3"
            disabled={!startDate || !endDate || days <= 0}
            onClick={() => setStep(2)}
          >
            Next… Protection options
          </button>
        </div>
      )}

      {/* STEP 2: Protection */}
      {step === 2 && (
        <div className="animate-fade-in">
          <button className="text-sm text-primary mb-4" onClick={() => setStep(1)}>← Back to extras</button>
          <h4 className="mb-4">What&apos;s covered</h4>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3"></th>
                  <th className="p-3 bg-surface rounded-t-lg">Basic protection</th>
                  <th className="p-3 bg-primary-glow text-primary rounded-t-lg border border-b-0 border-primary">Full Protection</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3 font-semibold">Theft of car</td>
                  <td className="p-3 bg-surface">You pay EGP 59,000.45<br/><span className="text-xs text-danger">No refund</span></td>
                  <td className="p-3 bg-primary-glow border-l border-r border-primary">Refund for anything you pay<br/><span className="text-xs text-success">Refund</span></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 font-semibold">Bodywork damage</td>
                  <td className="p-3 bg-surface">You pay up to EGP 59,000.45<br/><span className="text-xs text-danger">No refund</span></td>
                  <td className="p-3 bg-primary-glow border-l border-r border-primary">Refund for anything you pay<br/><span className="text-xs text-success">Refund</span></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 font-semibold">Any other damage<br/><span className="text-xs font-normal">Tyres, windows, engine, etc.</span></td>
                  <td className="p-3 bg-surface">You pay the full cost<br/><span className="text-xs text-danger">No refund</span></td>
                  <td className="p-3 bg-primary-glow border-l border-r border-primary">Refund for anything you pay<br/><span className="text-xs text-success">Refund</span></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 font-semibold">Breakdown costs</td>
                  <td className="p-3 bg-surface">You pay the full cost<br/><span className="text-xs text-danger">No refund</span></td>
                  <td className="p-3 bg-primary-glow border-l border-r border-primary">Refund for anything you pay<br/><span className="text-xs text-success">Refund</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Other costs<br/><span className="text-xs font-normal">Cleaning, lost keys, etc.</span></td>
                  <td className="p-3 bg-surface rounded-b-lg">You pay the full cost<br/><span className="text-xs text-danger">No refund</span></td>
                  <td className="p-3 bg-primary-glow border-l border-r border-b border-primary rounded-b-lg">You pay the full cost<br/><span className="text-xs text-danger">No refund</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid-2 gap-4">
            <button className="btn btn-secondary py-3 flex flex-col items-center justify-center gap-1" onClick={() => { setHasFullProtection(false); setStep(3); }}>
              <span className="font-bold">Go to book</span>
              <span className="text-xs opacity-80">Without Full Protection</span>
              <span className="text-sm mt-1">EGP 0</span>
            </button>
            <button className="btn btn-primary py-3 flex flex-col items-center justify-center gap-1" onClick={() => { setHasFullProtection(true); setStep(3); }}>
              <span className="font-bold">Go to book</span>
              <span className="text-xs opacity-80">With Full Protection</span>
              <span className="text-sm mt-1">EGP 3,489.04</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Details & Payment */}
      {step === 3 && (
        <div className="animate-fade-in">
          <button className="text-sm text-primary mb-4" onClick={() => setStep(2)}>← Back to protection</button>
          
          <h4 className="mb-4">Main driver&apos;s details</h4>
          <p className="text-xs text-secondary mb-4">As they appear on driving licence</p>
          <div className="grid-2 gap-4 mb-4">
            <div className="form-group">
              <label className="label">First name*</label>
              <input
                type="text"
                className={`input ${!driverFirstName && errorMsg ? 'border-danger' : ''}`}
                placeholder="Ahmed"
                value={driverFirstName}
                onChange={(e) => setDriverFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">Last name*</label>
              <input
                type="text"
                className={`input ${!driverLastName && errorMsg ? 'border-danger' : ''}`}
                placeholder="Hassan"
                value={driverLastName}
                onChange={(e) => setDriverLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group mb-4">
            <label className="label">Email address*</label>
            <p className="text-xs text-secondary mb-1">So we can send the confirmation email and voucher</p>
            <input
              type="email"
              className={`input ${!driverEmail && errorMsg ? 'border-danger' : ''}`}
              placeholder="ahmed@example.com"
              value={driverEmail}
              onChange={(e) => setDriverEmail(e.target.value)}
            />
          </div>
          <div className="form-group mb-4">
            <label className="label">Contact number*</label>
            <p className="text-xs text-secondary mb-1">So we can call if any problems come up</p>
            <div className="flex gap-2">
              <select className="select input" style={{ width: "120px" }}>
                <option>+20 (EG)</option>
              </select>
              <input
                type="text"
                className={`input flex-1 ${!driverPhone && errorMsg ? 'border-danger' : ''}`}
                placeholder="01234567890"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group mb-6">
            <label className="label">Country of residence*</label>
            <select
              className="select input"
              value={driverCountry}
              onChange={(e) => setDriverCountry(e.target.value)}
            >
              <option value="Egypt">Egypt</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="UAE">UAE</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
            </select>
          </div>

          <hr className="my-6 border-border" />
          <h4 className="mb-4">Billing address</h4>
          <div className="form-group mb-4">
            <label className="label">Address*</label>
            <p className="text-xs text-secondary mb-1">House/apartment number and street name</p>
            <input
              type="text"
              className={`input ${!billingAddress && errorMsg ? 'border-danger' : ''}`}
              placeholder="15 El Tahrir St."
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
            />
          </div>
          <div className="grid-2 gap-4 mb-4">
            <div className="form-group">
              <label className="label">City*</label>
              <input
                type="text"
                className={`input ${!billingCity && errorMsg ? 'border-danger' : ''}`}
                placeholder="Cairo"
                value={billingCity}
                onChange={(e) => setBillingCity(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">Postcode*</label>
              <input
                type="text"
                className={`input ${!billingPostcode && errorMsg ? 'border-danger' : ''}`}
                placeholder="11511"
                value={billingPostcode}
                onChange={(e) => setBillingPostcode(e.target.value)}
              />
            </div>
          </div>

          <hr className="my-6 border-border" />
          <h4 className="mb-4">How would you like to pay?</h4>
          <div className="grid-2 gap-2 mb-6">
            {["Visa / Mastercard", "InstaPay", "Vodafone Cash", "Etisalat Cash"].map((method) => (
              <div 
                key={method} 
                className={`p-3 rounded-lg cursor-pointer text-sm font-semibold transition-all ${paymentMethod === method ? 'bg-primary text-white' : 'bg-surface text-secondary border border-transparent hover:border-primary'}`}
                style={{ border: paymentMethod === method ? "1px solid var(--primary)" : "1px solid var(--border)", background: paymentMethod === method ? "var(--primary-glow)" : "var(--bg-surface)", color: paymentMethod === method ? "var(--accent)" : "inherit" }}
                onClick={() => setPaymentMethod(method)}
              >
                <div className="flex items-center gap-2">
                  <input type="radio" checked={paymentMethod === method} readOnly style={{ accentColor: "var(--primary)" }} />
                  {method}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Credentials Input Section */}
          <div className="p-5 rounded-2xl mb-6 bg-surface border border-border space-y-4">
            <h5 className="font-bold text-sm text-primary flex items-center gap-2">
              💳 Payment Credentials — {paymentMethod}
            </h5>

            {paymentMethod === "Visa / Mastercard" ? (
              <div className="space-y-4">
                <div className="form-group">
                  <label className="label">Cardholder Name*</label>
                  <input
                    type="text"
                    className={`input ${!cardHolder && errorMsg ? 'border-danger' : ''}`}
                    placeholder="Name as it appears on card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Card Number*</label>
                  <input
                    type="text"
                    className={`input font-mono ${!cardNumber && errorMsg ? 'border-danger' : ''}`}
                    placeholder="4532 •••• •••• 8892"
                    maxLength={19}
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                  />
                </div>

                <div className="grid-2 gap-4">
                  <div className="form-group">
                    <label className="label">Expiry Date (MM/YY)*</label>
                    <input
                      type="text"
                      className={`input font-mono ${!expiry && errorMsg ? 'border-danger' : ''}`}
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={handleExpiryChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">CVC Code*</label>
                    <input
                      type="password"
                      className={`input font-mono ${!cvc && errorMsg ? 'border-danger' : ''}`}
                      placeholder="123"
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="form-group">
                  <label className="label">{paymentMethod} Mobile Number*</label>
                  <input
                    type="tel"
                    className={`input font-mono ${!walletPhone && errorMsg ? 'border-danger' : ''}`}
                    placeholder="01234567890"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                  />
                </div>
                <p className="text-xs text-secondary">
                  Enter your registered {paymentMethod} number. A payment confirmation prompt will be sent to your device.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between mb-2 text-sm text-secondary">
              <span>{vehicle.daily_rate} EGP x {days} days</span>
              <span>{baseRent} EGP</span>
            </div>
            {extrasCost > 0 && (
              <div className="flex justify-between mb-2 text-sm text-secondary">
                <span>Selected Extras</span>
                <span>{extrasCost} EGP</span>
              </div>
            )}
            {protectionCost > 0 && (
              <div className="flex justify-between mb-2 text-sm text-secondary">
                <span>Full Protection</span>
                <span>{protectionCost} EGP</span>
              </div>
            )}
            <div className="flex justify-between mb-2 text-sm text-secondary">
              <span>Security Deposit (Refundable)</span>
              <span>{deposit} EGP</span>
            </div>
            <hr style={{ borderColor: "var(--border)", margin: "0.5rem 0" }} />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Due Now</span>
              <span className="text-primary">{totalCost.toLocaleString()} EGP</span>
            </div>
          </div>

          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-bold animate-shake">
              {errorMsg}
            </div>
          )}

          <button 
            className="btn btn-primary w-full py-4 text-lg font-bold" 
            onClick={handleBook}
            disabled={loading}
          >
            {loading ? "Processing Payment..." : "Confirm & Pay"}
          </button>
        </div>
      )}
    </div>
  );
}
