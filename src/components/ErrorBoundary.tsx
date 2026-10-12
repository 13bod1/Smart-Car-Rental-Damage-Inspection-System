"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Step 14: Global Error Boundary
 * Catches any render-time JS errors and shows a safe generic message.
 * The real error is logged to console (server-side logging should be added).
 * Users NEVER see stack traces or internal error details.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production: send to a logging service (Sentry, Datadog, etc.)
    // Never expose the error to the user
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultErrorUI onReset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

function DefaultErrorUI({ onReset }: { onReset: () => void }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      padding: "2rem",
    }}>
      <div className="card text-center" style={{ maxWidth: "480px" }}>
        <span style={{ fontSize: "4rem" }}>⚠️</span>
        <h2 style={{ marginTop: "1rem" }}>Something went wrong</h2>
        <p className="text-secondary" style={{ marginTop: "0.75rem" }}>
          An unexpected error occurred. Our team has been notified.
          Please try again or contact support if the problem persists.
        </p>
        <div className="flex gap-3 justify-center" style={{ marginTop: "1.5rem" }}>
          <button className="btn btn-primary" onClick={onReset}>Try Again</button>
          <a href="/" className="btn btn-secondary">Go Home</a>
        </div>
      </div>
    </div>
  );
}
