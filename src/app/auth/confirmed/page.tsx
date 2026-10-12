import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function ConfirmedPage() {
  return (
    <div className="page-wrapper min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card text-center max-w-md animate-fade-in" style={{ padding: "3rem 2rem" }}>
          <div className="mb-6" style={{ fontSize: "5rem", lineHeight: "1" }}>🎉</div>
          <h1 className="mb-4 text-3xl font-bold" style={{ color: "var(--success)" }}>
            Email Confirmed!
          </h1>
          <p className="text-secondary text-lg mb-8">
            Thank you for confirming your account. Your email has been successfully verified!
          </p>
          <Link href="/dashboard" className="btn btn-primary w-full py-4 text-lg font-bold">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
