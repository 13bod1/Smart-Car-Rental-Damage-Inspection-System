"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export function AIChatWidget() {
  const { lang, dir, trans } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting based on current language
  useEffect(() => {
    setMessages([
      { role: "model", text: trans.chatGreeting },
    ]);
  }, [lang, trans.chatGreeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(1), // skip initial greeting
        }),
      });

      if (!resp.ok) throw new Error("Failed");
      const data = await resp.json();
      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: trans.chatError },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button
        id="ai-chat-fab"
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
          right: lang === "ar" ? "auto" : "1.5rem",
          left: lang === "ar" ? "1.5rem" : "auto",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "var(--gradient-accent)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          boxShadow: "0 4px 24px rgba(59,130,246,0.4)",
          zIndex: 999,
          transition: "transform 0.3s, box-shadow 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(59,130,246,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(59,130,246,0.4)";
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          dir={dir}
          className="animate-fade-in"
          style={{
            position: "fixed",
            bottom: "calc(5.5rem + env(safe-area-inset-bottom))",
            right: lang === "ar" ? "auto" : "1.5rem",
            left: lang === "ar" ? "1.5rem" : "auto",
            width: "min(380px, calc(100vw - 2rem))",
            height: "min(500px, calc(100vh - 10rem))",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 16px 64px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 998,
            fontFamily: lang === "ar" ? "Cairo, sans-serif" : "inherit",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            background: "rgba(37,99,235,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <span style={{ fontSize: "1.5rem" }}>🤖</span>
            <div>
              <p className="font-bold" style={{ fontSize: "0.9rem" }}>{trans.chatAdvisorTitle}</p>
              <p className="text-xs text-muted">{trans.chatAdvisorSubtitle}</p>
            </div>
            <div style={{
              marginInlineStart: "auto",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--success)",
              boxShadow: "0 0 8px var(--success)",
            }} />
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: msg.role === "user"
                    ? "var(--gradient-accent)"
                    : "var(--bg-elevated)",
                  border: msg.role === "user" ? "none" : "1px solid var(--border)",
                  borderRadius: msg.role === "user"
                    ? "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)"
                    : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
                  padding: "0.75rem 1rem",
                }}
              >
                <p className="text-sm" style={{
                  color: msg.role === "user" ? "white" : "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                }}>
                  {msg.text}
                </p>
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: "flex-start",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
                padding: "0.75rem 1rem",
              }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--accent-light)",
                      animation: `pulse-glow 1.4s ${i * 0.2}s infinite ease-in-out`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "0.75rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "0.5rem",
          }}>
            <input
              id="ai-chat-input"
              className="input"
              style={{ flex: 1, padding: "0.625rem 0.875rem", fontSize: "0.85rem" }}
              placeholder={trans.chatPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
            />
            <button
              id="ai-chat-send"
              className="btn btn-primary btn-sm"
              onClick={send}
              disabled={loading || !input.trim()}
              style={{ padding: "0.625rem 1rem" }}
            >
              {lang === "ar" ? "◀" : "➤"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
