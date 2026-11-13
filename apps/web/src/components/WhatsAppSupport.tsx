"use client";

import { useLanguage } from "@/lib/LanguageContext";

export function WhatsAppSupport() {
  const { lang, trans } = useLanguage();
  const phone = "+201000000000"; // Egypt Fleet Support Line
  const message = encodeURIComponent(trans.whatsappMessage);
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <aside
      aria-label="WhatsApp Support"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: lang === "ar" ? "1.5rem" : "auto",
        right: lang === "ar" ? "auto" : "1.5rem",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
      }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "#25D366",
          color: "#ffffff",
          padding: "0.65rem 1.15rem",
          borderRadius: "9999px",
          fontWeight: 600,
          fontSize: "0.9rem",
          boxShadow: "0 4px 14px rgba(37, 211, 102, 0.4)",
          textDecoration: "none",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 211, 102, 0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 211, 102, 0.4)";
        }}
        title={trans.whatsappSupport}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.996.586 3.86 1.6 5.438L2 22l4.678-1.545a10.01 10.01 0 005.353 1.576h.005c5.536 0 10.031-4.495 10.031-10.031C22.067 6.495 17.567 2 12.031 2zm5.882 14.246c-.244.686-1.42 1.29-1.97 1.348-.507.053-1.162.08-3.763-.984-2.222-.909-3.664-3.14-3.774-3.288-.11-.148-.909-1.21-1.21-2.311-.301-1.1-.035-2.038.258-2.33.293-.292.645-.365.86-.365.215 0 .43.003.618.012.2.01.468-.076.732.559.273.655.932 2.278 1.014 2.443.082.166.137.36.027.579-.11.22-.165.357-.33.549-.165.193-.347.43-.495.578-.165.166-.337.347-.145.677.192.33 1.05 1.728 2.254 2.8 1.548 1.378 2.855 1.805 3.258 2.007.404.202.642.169.88-.105.239-.275 1.02-1.19 1.294-1.599.275-.41.55-.342.923-.203.374.138 2.37 1.118 2.777 1.321.407.203.678.305.779.475.101.17.101.983-.143 1.669z" />
        </svg>
        <span>{trans.whatsappSupport}</span>
      </a>
    </aside>
  );
}
