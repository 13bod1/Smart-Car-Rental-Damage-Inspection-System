import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0c14",
      fontFamily: "Inter, sans-serif",
      color: "#f0f4ff",
      padding: "2rem",
    }}>
      <div style={{ textAlign: "center", maxWidth: "400px" }}>
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🔍</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          Page Not Found
        </h1>
        <p style={{ color: "#8fa3c0", marginBottom: "2rem", lineHeight: 1.6 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" style={{
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          color: "white", textDecoration: "none", borderRadius: "12px",
          padding: "0.75rem 2rem", fontWeight: 600, display: "inline-block",
        }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
