"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export function RentalTerms() {
  const { lang, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card mt-8" dir={dir} style={{ border: "1px solid var(--border)", background: "var(--bg-surface)", fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center"
        style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "0.5rem 0" }}
      >
        <h3 style={{ margin: 0 }}>
          {lang === "ar" ? "📜 شروط وقواعد الإيجار والوثائق المطلوبة" : "📜 Important Rental Terms & Rules"}
        </h3>
        <span style={{ fontSize: "1.5rem", transition: "transform 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-6 text-sm text-secondary" style={{ lineHeight: "1.6" }}>
          {lang === "ar" ? (
            <>
              <h4 className="text-primary mb-2">متطلبات السائق والوثائق الرسمية</h4>
              <ul className="mb-4 list-disc pr-5">
                <li><strong>عند استلام السيارة يلزم إحضار:</strong> بطاقة الرقم القومي أو جواز السفر الساري، رخصة قيادة صالحة، وبطاقة ائتمان للوديعة.</li>
                <li><strong>السن المطلوب:</strong> يجب ألا يقل عمر السائق عن 21 عاماً ولا يزيد عن 70 عاماً.</li>
                <li><strong>قواعد الرخصة:</strong> يجب أن تكون الرخصة سارية لمدة لا تقل عن 12 شهراً. للمستأجرين الأجانب يلزم رخصة قيادة دولية.</li>
                <li><strong>السائق الإضافي:</strong> يجب حضور السائق الأساسي بنفسه عند الاستلام.</li>
              </ul>

              <h4 className="text-primary mb-2">الوديعة المستردة وطرق الدفع المقبولة</h4>
              <ul className="mb-4 list-disc pr-5">
                <li><strong>الوديعة:</strong> يتم حجز وديعة مستردة مؤقتاً لتغطية أي مخالفات مرورية أو أضرار غير مشمولة، وتسترد فور تسليم السيارة بحالة سليمة.</li>
                <li><strong>البطاقات المقبولة:</strong> فيزا وماستركارد سارية بالاسم الكامل ورقم الحساب.</li>
              </ul>

              <h4 className="text-primary mb-2">سياسة الوقود والمسافات</h4>
              <ul className="mb-4 list-disc pr-5">
                <li><strong>سياسة الوقود:</strong> تستلم السيارة بنفس مستوى الوقود وتعيدها بنفس المستوى لتجنب أي رسوم وقود إضافية.</li>
                <li><strong>الكيلومترات:</strong> تشتمل العقود على حد كيلومترات مجاني يومي مريح، ويتم احتساب الكيلومتر الزائد بأسعار واضحة ومحددة بالعقد.</li>
              </ul>

              <p className="text-xs text-muted mt-6 italic">
                بإتمامك لهذا الحجز، فإنك تؤكد اطلاعك وموافقتك على شروط الإيجار الرسمية. يحق لمالك الأسطول رفض تسليم السيارة في حال عدم استيفاء الوثائق المقررة.
              </p>
            </>
          ) : (
            <>
              <h4 className="text-primary mb-2">Driver & Licence Requirements</h4>
              <ul className="mb-4 list-disc pl-5">
                <li><strong>When you pick the car up, you'll need:</strong> Passport or national ID card, Driving licence, Credit card.</li>
                <li><strong>Age Requirements:</strong> To drive this car, you must be at least 21 and under the age of 70.</li>
                <li><strong>Licence Rules:</strong> Digital driving licences will not be accepted. All drivers must have held their driving licence for at least 12 months. Foreign renters are required to have an International Driving Permit.</li>
                <li><strong>Additional drivers:</strong> The main driver must be present.</li>
              </ul>

              <h4 className="text-primary mb-2">Security Deposit & Accepted Cards</h4>
              <ul className="mb-4 list-disc pl-5">
                <li><strong>Deposit:</strong> At pick-up, the main driver will leave a refundable security deposit on their card. Returned upon safe drop-off.</li>
                <li><strong>Accepted cards:</strong> MasterCard and Visa.</li>
              </ul>

              <h4 className="text-primary mb-2">Fuel Policy & Kilometres</h4>
              <ul className="mb-4 list-disc pl-5">
                <li><strong>Fuel policy (Like for like):</strong> Pick up full/partly full, return with the same amount.</li>
                <li><strong>Kilometres:</strong> Generous free daily allowance included per rental.</li>
              </ul>

              <p className="text-xs text-muted mt-6 italic">
                By making this booking, you confirm that you have read and accept the rental terms.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
