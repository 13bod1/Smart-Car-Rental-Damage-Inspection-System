"use client";

import { useState } from "react";
import { Vehicle } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/LanguageContext";

interface CheckoutFormProps {
  vehicle: Vehicle;
  onSuccess: () => void;
}

const EXTRAS = [
  { id: "add_driver", name: "Additional driver", nameAr: "سائق إضافي", price: 685, desc: "If you want other people to drive as well", descAr: "في حال رغبة شخص آخر بالقيادة" },
  { id: "child_seat", name: "Child seat", nameAr: "كرسي أطفال", price: 685, desc: "For small children: 9-18 kg (about 1-3 years old)", descAr: "للأطفال الصغار (1-3 سنوات)" },
  { id: "gps", name: "GPS", nameAr: "جهاز ملاحة GPS", price: 685, desc: "Satellite navigation device that provides directions", descAr: "جهاز ملاحة بالأقمار الصناعية لتوجيه المسار" },
  { id: "baby_seat", name: "Baby seat", nameAr: "كرسي رضيع", price: 685, desc: "For babies: up to 9 kg (about 1 year old)", descAr: "للرضع حتى عمر سنة" },
  { id: "booster", name: "Child booster seat", nameAr: "كرسي داعم للأطفال", price: 685, desc: "For bigger children: 18-45 kg (about 4-11 years old)", descAr: "للأطفال الأكبر سناً (4-11 سنة)" },
];

export function CheckoutForm({ vehicle, onSuccess }: CheckoutFormProps) {
  const { lang, dir, trans } = useLanguage();
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
      setErrorMsg(lang === "ar" ? "⚠️ يرجى استكمال جميع البيانات المطلوبة وبيانات الدفع." : "⚠️ Please fill up the credentials.");
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
        throw new Error(data.error || (lang === "ar" ? "تعذر إرسال طلب الحجز." : "Booking request failed."));
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
      setErrorMsg(e.message || (lang === "ar" ? "فشلت عملية الحجز." : "Booking failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-2 animate-fade-in" dir={dir} style={{ fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit" }}>
      <h3 className="mb-4">{lang === "ar" ? "حجز هذه السيارة" : "Reserve this Vehicle"}</h3>

      {/* STEP 1: Dates & Extras */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div className="p-3 mb-4 rounded bg-success-light text-success font-semibold text-sm">
            {lang === "ar" ? "✓ إلغاء مجاني حتى 48 ساعة قبل موعد الاستلام" : "✓ Free cancellation up to 48 hours before pick-up"}
          </div>
          <p className="text-sm text-secondary mb-4">
            {lang === "ar"
              ? "مواعيد استلام السيارات محددة بدقة، يرجى الحضور في الموعد المحدد لاستلام المفاتيح والسيارة بسلاسة."
              : "Rental companies only allow you to get your keys at your allocated pick-up time. Please arrive on time."}
          </p>

          <div className="grid-2 gap-4 mb-6">
            <div className="form-group">
              <label className="label">{lang === "ar" ? "تاريخ الاستلام" : "Pick-up Date"}</label>
              <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">{lang === "ar" ? "تاريخ الإعادة" : "Drop-off Date"}</label>
              <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <hr className="my-6 border-border" />
          <h4 className="mb-4">{lang === "ar" ? "إضافات اختيارية لرحلتك" : "Add extras, complete your trip"}</h4>
          <div className="flex flex-col gap-4 mb-6">
            {EXTRAS.map(ex => (
              <div key={ex.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-bold">{lang === "ar" ? ex.nameAr : ex.name}</div>
                  <div className="text-sm text-primary font-semibold">{ex.price.toLocaleString()} EGP {lang === "ar" ? "لكل إيجار" : "each per rental"}</div>
                  <div className="text-xs text-secondary mt-1">{lang === "ar" ? ex.descAr : ex.desc}</div>
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
            {lang === "ar" ? "التالي: خيارات الحماية والتأمين ←" : "Next… Protection options →"}
          </button>
        </div>
      )}

      {/* STEP 2: Protection */}
      {step === 2 && (
        <div className="animate-fade-in">
          <button className="text-sm text-primary mb-4" onClick={() => setStep(1)}>
            {lang === "ar" ? "→ العودة إلى الإضافات" : "← Back to extras"}
          </button>
          <h4 className="mb-4">{lang === "ar" ? "ما تشمله الحماية التأمينية" : "What's covered"}</h4>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-sm border-collapse" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3"></th>
                  <th className="p-3 bg-surface rounded-t-lg">{lang === "ar" ? "الحماية الأساسية" : "Basic protection"}</th>
                  <th className="p-3 bg-primary-glow text-primary rounded-t-lg border border-b-0 border-primary">{lang === "ar" ? "الحماية الكاملة الشاملة" : "Full Protection"}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3 font-semibold">{lang === "ar" ? "سرقة السيارة" : "Theft of car"}</td>
                  <td className="p-3 bg-surface">
                    {lang === "ar" ? "تدفع حتى 59,000 ج.م" : "You pay EGP 59,000.45"}<br/>
                    <span className="text-xs text-danger">{lang === "ar" ? "غير مسترد" : "No refund"}</span>
                  </td>
                  <td className="p-3 bg-primary-glow border-l border-r border-primary">
                    {lang === "ar" ? "استرداد كامل لأي مبلغ تدفعه" : "Refund for anything you pay"}<br/>
                    <span className="text-xs text-success">{lang === "ar" ? "مسترد بالكامل ✓" : "Refund"}</span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 font-semibold">{lang === "ar" ? "أضرار الهيكل الخارجي والطلاء" : "Bodywork damage"}</td>
                  <td className="p-3 bg-surface">
                    {lang === "ar" ? "تدفع حتى 59,000 ج.م" : "You pay up to EGP 59,000.45"}<br/>
                    <span className="text-xs text-danger">{lang === "ar" ? "غير مسترد" : "No refund"}</span>
                  </td>
                  <td className="p-3 bg-primary-glow border-l border-r border-primary">
                    {lang === "ar" ? "استرداد كامل لأي مبلغ تدفعه" : "Refund for anything you pay"}<br/>
                    <span className="text-xs text-success">{lang === "ar" ? "مسترد بالكامل ✓" : "Refund"}</span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 font-semibold">
                    {lang === "ar" ? "أي أضرار أخرى" : "Any other damage"}<br/>
                    <span className="text-xs font-normal">{lang === "ar" ? "الإطارات، النوافذ، المحرك، إلخ." : "Tyres, windows, engine, etc."}</span>
                  </td>
                  <td className="p-3 bg-surface">
                    {lang === "ar" ? "تدفع كامل التكلفة" : "You pay the full cost"}<br/>
                    <span className="text-xs text-danger">{lang === "ar" ? "غير مسترد" : "No refund"}</span>
                  </td>
                  <td className="p-3 bg-primary-glow border-l border-r border-primary">
                    {lang === "ar" ? "استرداد كامل لأي مبلغ تدفعه" : "Refund for anything you pay"}<br/>
                    <span className="text-xs text-success">{lang === "ar" ? "مسترد بالكامل ✓" : "Refund"}</span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 font-semibold">{lang === "ar" ? "تكاليف سحب وأعطال الطريق" : "Breakdown costs"}</td>
                  <td className="p-3 bg-surface">
                    {lang === "ar" ? "تدفع كامل التكلفة" : "You pay the full cost"}<br/>
                    <span className="text-xs text-danger">{lang === "ar" ? "غير مسترد" : "No refund"}</span>
                  </td>
                  <td className="p-3 bg-primary-glow border-l border-r border-primary">
                    {lang === "ar" ? "استرداد كامل لأي مبلغ تدفعه" : "Refund for anything you pay"}<br/>
                    <span className="text-xs text-success">{lang === "ar" ? "مسترد بالكامل ✓" : "Refund"}</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">
                    {lang === "ar" ? "تكاليف أخرى" : "Other costs"}<br/>
                    <span className="text-xs font-normal">{lang === "ar" ? "التنظيف، فقدان المفاتيح، إلخ." : "Cleaning, lost keys, etc."}</span>
                  </td>
                  <td className="p-3 bg-surface rounded-b-lg">
                    {lang === "ar" ? "تدفع كامل التكلفة" : "You pay the full cost"}<br/>
                    <span className="text-xs text-danger">{lang === "ar" ? "غير مسترد" : "No refund"}</span>
                  </td>
                  <td className="p-3 bg-primary-glow border-l border-r border-b border-primary rounded-b-lg">
                    {lang === "ar" ? "تدفع كامل التكلفة" : "You pay the full cost"}<br/>
                    <span className="text-xs text-danger">{lang === "ar" ? "غير مسترد" : "No refund"}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid-2 gap-4">
            <button className="btn btn-secondary py-3 flex flex-col items-center justify-center gap-1" onClick={() => { setHasFullProtection(false); setStep(3); }}>
              <span className="font-bold">{lang === "ar" ? "المتابعة للحجز" : "Go to book"}</span>
              <span className="text-xs opacity-80">{lang === "ar" ? "بدون حماية شاملة" : "Without Full Protection"}</span>
              <span className="text-sm mt-1">{lang === "ar" ? "0 ج.م" : "EGP 0"}</span>
            </button>
            <button className="btn btn-primary py-3 flex flex-col items-center justify-center gap-1" onClick={() => { setHasFullProtection(true); setStep(3); }}>
              <span className="font-bold">{lang === "ar" ? "المتابعة للحجز" : "Go to book"}</span>
              <span className="text-xs opacity-80">{lang === "ar" ? "مع الحماية الشاملة" : "With Full Protection"}</span>
              <span className="text-sm mt-1">{lang === "ar" ? "3,489.04 ج.م" : "EGP 3,489.04"}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Details & Payment */}
      {step === 3 && (
        <div className="animate-fade-in">
          <button className="text-sm text-primary mb-4" onClick={() => setStep(2)}>
            {lang === "ar" ? "→ العودة إلى خيارات الحماية" : "← Back to protection"}
          </button>
          
          <h4 className="mb-4">{lang === "ar" ? "بيانات السائق الرئيسي" : "Main driver's details"}</h4>
          <p className="text-xs text-secondary mb-4">
            {lang === "ar" ? "كما تظهر بالضبط في رخصة القيادة" : "As they appear on driving licence"}
          </p>
          <div className="grid-2 gap-4 mb-4">
            <div className="form-group">
              <label className="label">{lang === "ar" ? "الاسم الأول*" : "First name*"}</label>
              <input
                type="text"
                className={`input ${!driverFirstName && errorMsg ? 'border-danger' : ''}`}
                placeholder={lang === "ar" ? "أحمد" : "Ahmed"}
                value={driverFirstName}
                onChange={(e) => setDriverFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">{lang === "ar" ? "اسم العائلة*" : "Last name*"}</label>
              <input
                type="text"
                className={`input ${!driverLastName && errorMsg ? 'border-danger' : ''}`}
                placeholder={lang === "ar" ? "حسن" : "Hassan"}
                value={driverLastName}
                onChange={(e) => setDriverLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group mb-4">
            <label className="label">{lang === "ar" ? "البريد الإلكتروني*" : "Email address*"}</label>
            <p className="text-xs text-secondary mb-1">
              {lang === "ar" ? "لإرسال قسيمة الإيجار وتأكيد الحجز فوراً" : "So we can send the confirmation email and voucher"}
            </p>
            <input
              type="email"
              className={`input ${!driverEmail && errorMsg ? 'border-danger' : ''}`}
              placeholder="ahmed@example.com"
              value={driverEmail}
              onChange={(e) => setDriverEmail(e.target.value)}
            />
          </div>
          <div className="form-group mb-4">
            <label className="label">{lang === "ar" ? "رقم الهاتف للتواصل*" : "Contact number*"}</label>
            <p className="text-xs text-secondary mb-1">
              {lang === "ar" ? "للتواصل معك في حال وجود أي تحديثات للطلب" : "So we can call if any problems come up"}
            </p>
            <div className="flex gap-2">
              <select className="select input" style={{ width: "120px" }}>
                <option>+20 (EG)</option>
                <option>+966 (KSA)</option>
                <option>+971 (UAE)</option>
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
            <label className="label">{lang === "ar" ? "بلد الإقامة*" : "Country of residence*"}</label>
            <select
              className="select input"
              value={driverCountry}
              onChange={(e) => setDriverCountry(e.target.value)}
            >
              <option value="Egypt">{lang === "ar" ? "مصر" : "Egypt"}</option>
              <option value="Saudi Arabia">{lang === "ar" ? "المملكة العربية السعودية" : "Saudi Arabia"}</option>
              <option value="UAE">{lang === "ar" ? "الإمارات العربية المتحدة" : "UAE"}</option>
              <option value="USA">{lang === "ar" ? "الولايات المتحدة" : "USA"}</option>
              <option value="UK">{lang === "ar" ? "المملكة المتحدة" : "UK"}</option>
            </select>
          </div>

          <hr className="my-6 border-border" />
          <h4 className="mb-4">{lang === "ar" ? "عنوان الفاتورة" : "Billing address"}</h4>
          <div className="form-group mb-4">
            <label className="label">{lang === "ar" ? "العنوان بالتفصيل*" : "Address*"}</label>
            <p className="text-xs text-secondary mb-1">
              {lang === "ar" ? "رقم المبنى/الشقة واسم الشارع" : "House/apartment number and street name"}
            </p>
            <input
              type="text"
              className={`input ${!billingAddress && errorMsg ? 'border-danger' : ''}`}
              placeholder={lang === "ar" ? "١٥ شارع التحرير، الدقي" : "15 El Tahrir St."}
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
            />
          </div>
          <div className="grid-2 gap-4 mb-4">
            <div className="form-group">
              <label className="label">{lang === "ar" ? "المدينة*" : "City*"}</label>
              <input
                type="text"
                className={`input ${!billingCity && errorMsg ? 'border-danger' : ''}`}
                placeholder={lang === "ar" ? "القاهرة" : "Cairo"}
                value={billingCity}
                onChange={(e) => setBillingCity(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">{lang === "ar" ? "الرمز البريدي*" : "Postcode*"}</label>
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
          <h4 className="mb-4">{lang === "ar" ? "طريقة الدفع المفضلة" : "How would you like to pay?"}</h4>
          <div className="grid-2 gap-2 mb-6">
            {[
              { id: "Visa / Mastercard", labelEn: "Visa / Mastercard", labelAr: "فيزا / ماستركارد" },
              { id: "InstaPay", labelEn: "InstaPay", labelAr: "إنستاباي (InstaPay)" },
              { id: "Vodafone Cash", labelEn: "Vodafone Cash", labelAr: "فودافون كاش" },
              { id: "Etisalat Cash", labelEn: "Etisalat Cash", labelAr: "اتصالات كاش" },
            ].map((method) => (
              <div 
                key={method.id} 
                className={`p-3 rounded-lg cursor-pointer text-sm font-semibold transition-all ${paymentMethod === method.id ? 'bg-primary text-white' : 'bg-surface text-secondary border border-transparent hover:border-primary'}`}
                style={{ border: paymentMethod === method.id ? "1px solid var(--primary)" : "1px solid var(--border)", background: paymentMethod === method.id ? "var(--primary-glow)" : "var(--bg-surface)", color: paymentMethod === method.id ? "var(--accent)" : "inherit" }}
                onClick={() => setPaymentMethod(method.id)}
              >
                <div className="flex items-center gap-2">
                  <input type="radio" checked={paymentMethod === method.id} readOnly style={{ accentColor: "var(--primary)" }} />
                  {lang === "ar" ? method.labelAr : method.labelEn}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Credentials Input Section */}
          <div className="p-5 rounded-2xl mb-6 bg-surface border border-border space-y-4">
            <h5 className="font-bold text-sm text-primary flex items-center gap-2">
              💳 {lang === "ar" ? `بيانات وسيلة الدفع — ${paymentMethod}` : `Payment Credentials — ${paymentMethod}`}
            </h5>

            {paymentMethod === "Visa / Mastercard" ? (
              <div className="space-y-4">
                <div className="form-group">
                  <label className="label">{lang === "ar" ? "اسم صاحب البطاقة*" : "Cardholder Name*"}</label>
                  <input
                    type="text"
                    className={`input ${!cardHolder && errorMsg ? 'border-danger' : ''}`}
                    placeholder={lang === "ar" ? "الاسم كما هو مدون على البطاقة" : "Name as it appears on card"}
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="label">{lang === "ar" ? "رقم البطاقة*" : "Card Number*"}</label>
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
                    <label className="label">{lang === "ar" ? "تاريخ الانتهاء (شهر/سنة)*" : "Expiry Date (MM/YY)*"}</label>
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
                    <label className="label">{lang === "ar" ? "رمز الأمان (CVC)*" : "CVC Code*"}</label>
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
                  <label className="label">{lang === "ar" ? `رقم محفظة ${paymentMethod}*` : `${paymentMethod} Mobile Number*`}</label>
                  <input
                    type="tel"
                    className={`input font-mono ${!walletPhone && errorMsg ? 'border-danger' : ''}`}
                    placeholder="01234567890"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                  />
                </div>
                <p className="text-xs text-secondary">
                  {lang === "ar"
                    ? `أدخل رقم ${paymentMethod} المسجل. سيتم إرسال إشعار فوري إلى هاتفك لتأكيد عملية الدفع.`
                    : `Enter your registered ${paymentMethod} number. A payment confirmation prompt will be sent to your device.`}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between mb-2 text-sm text-secondary">
              <span>{lang === "ar" ? `${vehicle.daily_rate} ج.م × ${days} يوم` : `${vehicle.daily_rate} EGP x ${days} days`}</span>
              <span>{baseRent.toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}</span>
            </div>
            {extrasCost > 0 && (
              <div className="flex justify-between mb-2 text-sm text-secondary">
                <span>{lang === "ar" ? "الإضافات المختارة" : "Selected Extras"}</span>
                <span>{extrasCost.toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}</span>
              </div>
            )}
            {protectionCost > 0 && (
              <div className="flex justify-between mb-2 text-sm text-secondary">
                <span>{lang === "ar" ? "الحماية الكاملة الشاملة" : "Full Protection"}</span>
                <span>{protectionCost.toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}</span>
              </div>
            )}
            <div className="flex justify-between mb-2 text-sm text-secondary">
              <span>{lang === "ar" ? "مبلغ التأمين (مسترد بالكامل)" : "Security Deposit (Refundable)"}</span>
              <span>{deposit.toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}</span>
            </div>
            <hr style={{ borderColor: "var(--border)", margin: "0.5rem 0" }} />
            <div className="flex justify-between font-bold text-lg">
              <span>{lang === "ar" ? "الإجمالي المستحق الآن" : "Total Due Now"}</span>
              <span className="text-primary">{totalCost.toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}</span>
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
            {loading 
              ? (lang === "ar" ? "جاري معالجة الدفع والحجز..." : "Processing Payment...") 
              : (lang === "ar" ? "تأكيد الحجز والدفع 🔒" : "Confirm & Pay")}
          </button>
        </div>
      )}
    </div>
  );
}
