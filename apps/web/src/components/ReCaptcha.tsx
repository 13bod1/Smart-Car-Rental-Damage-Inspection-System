"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// Google's official public reCAPTCHA v2 checkbox test site key (works on ALL domains)
const PUBLIC_TEST_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || PUBLIC_TEST_SITE_KEY;

interface ReCaptchaProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "dark" | "light";
  className?: string;
}

interface TileItem {
  id: number;
  isTarget: boolean;
  emoji: string;
  label: string;
}

interface PuzzleTopic {
  title: string;
  targetName: string;
  targets: { emoji: string; label: string }[];
  distractors: { emoji: string; label: string }[];
}

const PUZZLE_TOPICS: PuzzleTopic[] = [
  {
    title: "Select all CAR images below:",
    targetName: "CAR",
    targets: [
      { emoji: "🚗", label: "Car" },
      { emoji: "🏎️", label: "Sports Car" },
      { emoji: "🚙", label: "SUV" },
    ],
    distractors: [
      { emoji: "✈️", label: "Airplane" },
      { emoji: "⛵", label: "Boat" },
      { emoji: "🚲", label: "Bicycle" },
      { emoji: "🛸", label: "UFO" },
      { emoji: "🚁", label: "Helicopter" },
      { emoji: "🚀", label: "Rocket" },
      { emoji: "🚂", label: "Train" },
      { emoji: "🚜", label: "Tractor" },
    ],
  },
  {
    title: "Select all BICYCLE / TWO-WHEELER images below:",
    targetName: "BICYCLE / TWO-WHEELER",
    targets: [
      { emoji: "🚲", label: "Bicycle" },
      { emoji: "🛵", label: "Scooter" },
      { emoji: "🏍️", label: "Motorbike" },
    ],
    distractors: [
      { emoji: "🚗", label: "Car" },
      { emoji: "⛵", label: "Sailboat" },
      { emoji: "✈️", label: "Airplane" },
      { emoji: "🚁", label: "Helicopter" },
      { emoji: "🚀", label: "Rocket" },
      { emoji: "🚢", label: "Ship" },
      { emoji: "🏎️", label: "Race Car" },
      { emoji: "🚌", label: "Bus" },
    ],
  },
  {
    title: "Select all BOAT / WATERCRAFT images below:",
    targetName: "BOAT / WATERCRAFT",
    targets: [
      { emoji: "⛵", label: "Sailboat" },
      { emoji: "🚤", label: "Speedboat" },
      { emoji: "🚢", label: "Passenger Ship" },
    ],
    distractors: [
      { emoji: "🚗", label: "Car" },
      { emoji: "🚲", label: "Bicycle" },
      { emoji: "✈️", label: "Airplane" },
      { emoji: "🏎️", label: "Sports Car" },
      { emoji: "🛸", label: "UFO" },
      { emoji: "🚁", label: "Helicopter" },
      { emoji: "🚌", label: "Bus" },
      { emoji: "🚒", label: "Fire Engine" },
    ],
  },
  {
    title: "Select all ANIMAL / PET images below:",
    targetName: "ANIMAL",
    targets: [
      { emoji: "🐶", label: "Dog" },
      { emoji: "🐱", label: "Cat" },
      { emoji: "🦁", label: "Lion" },
    ],
    distractors: [
      { emoji: "🚗", label: "Car" },
      { emoji: "✈️", label: "Airplane" },
      { emoji: "⛵", label: "Sailboat" },
      { emoji: "🚲", label: "Bicycle" },
      { emoji: "🚀", label: "Rocket" },
      { emoji: "🛸", label: "UFO" },
      { emoji: "🏎️", label: "Race Car" },
      { emoji: "🚙", label: "SUV" },
    ],
  },
  {
    title: "Select all FOOD / DRINK images below:",
    targetName: "FOOD",
    targets: [
      { emoji: "🍕", label: "Pizza" },
      { emoji: "🍔", label: "Burger" },
      { emoji: "🍎", label: "Apple" },
    ],
    distractors: [
      { emoji: "🚗", label: "Car" },
      { emoji: "✈️", label: "Airplane" },
      { emoji: "⛵", label: "Sailboat" },
      { emoji: "🚲", label: "Bicycle" },
      { emoji: "🚀", label: "Rocket" },
      { emoji: "🛸", label: "UFO" },
      { emoji: "🏎️", label: "Sports Car" },
      { emoji: "🛵", label: "Scooter" },
    ],
  },
];

function generatePuzzleData() {
  // Pick random topic
  const topicIndex = Math.floor(Math.random() * PUZZLE_TOPICS.length);
  const topic = PUZZLE_TOPICS[topicIndex];

  // Pick 3 targets
  const targets = [...topic.targets];

  // Pick 6 random distractors from topic
  const shuffledDistractors = [...topic.distractors].sort(() => Math.random() - 0.5);
  const distractors = shuffledDistractors.slice(0, 6);

  // Combine into 9 items and shuffle
  const items: TileItem[] = [
    ...targets.map((t, i) => ({ id: i + 1, isTarget: true, ...t })),
    ...distractors.map((d, i) => ({ id: i + 4, isTarget: false, ...d })),
  ].sort(() => Math.random() - 0.5);

  return { topic, tiles: items };
}

export function ReCaptcha({
  onSuccess,
  onError,
  onExpire,
  theme = "dark",
  className = "",
}: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);

  // Fallback interactive puzzle state
  const [showFallbackPuzzle, setShowFallbackPuzzle] = useState(false);
  const [puzzleData, setPuzzleData] = useState(() => generatePuzzleData());
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [puzzleVerified, setPuzzleVerified] = useState(false);
  const [puzzleError, setPuzzleError] = useState(false);

  const resetPuzzle = useCallback(() => {
    setPuzzleData(generatePuzzleData());
    setSelectedTiles([]);
    setPuzzleError(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const renderGoogleWidget = () => {
      if (
        (window as any).grecaptcha &&
        (window as any).grecaptcha.render &&
        containerRef.current &&
        widgetIdRef.current === null
      ) {
        try {
          widgetIdRef.current = (window as any).grecaptcha.render(
            containerRef.current,
            {
              sitekey: RECAPTCHA_SITE_KEY,
              theme: theme,
              callback: (token: string) => {
                if (isMounted) {
                  setPuzzleVerified(true);
                  onSuccess(token);
                }
              },
              "expired-callback": () => {
                if (isMounted) {
                  setPuzzleVerified(false);
                  onExpire?.();
                }
              },
              "error-callback": () => {
                if (isMounted) {
                  onError?.();
                }
              },
            }
          );
          setScriptLoaded(true);
        } catch (e) {
          console.warn("reCAPTCHA Google render error, using fallback puzzle:", e);
          if (isMounted) {
            setGoogleFailed(true);
            setShowFallbackPuzzle(true);
          }
        }
      }
    };

    // If script isn't loaded after 3.5s, switch to fallback puzzle automatically
    const timeoutTimer = setTimeout(() => {
      if (isMounted && widgetIdRef.current === null) {
        setGoogleFailed(true);
        setShowFallbackPuzzle(true);
      }
    }, 3500);

    // Global callback for script load
    (window as any).onGoogleRecaptchaLoad = () => {
      if (isMounted) {
        setScriptLoaded(true);
        renderGoogleWidget();
      }
    };

    if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
      setScriptLoaded(true);
      renderGoogleWidget();
    } else {
      const scriptId = "google-recaptcha-v2-official-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://www.google.com/recaptcha/api.js?onload=onGoogleRecaptchaLoad&render=explicit`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          if (isMounted) {
            setGoogleFailed(true);
            setShowFallbackPuzzle(true);
          }
        };
        document.head.appendChild(script);
      } else {
        script.addEventListener("load", () => {
          if (isMounted) {
            setScriptLoaded(true);
            renderGoogleWidget();
          }
        });
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutTimer);
    };
  }, [theme, onSuccess, onError, onExpire]);

  // Handle fallback tile toggle
  const toggleTile = (id: number) => {
    if (puzzleVerified) return;
    setPuzzleError(false);
    setSelectedTiles((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Verify fallback puzzle
  const handleVerifyPuzzle = () => {
    const targetIds = puzzleData.tiles.filter((t) => t.isTarget).map((t) => t.id);
    const isCorrect =
      selectedTiles.length === targetIds.length &&
      targetIds.every((id) => selectedTiles.includes(id));

    if (isCorrect) {
      setPuzzleVerified(true);
      setPuzzleError(false);
      onSuccess("fallback-puzzle-token-" + Date.now());
    } else {
      setPuzzleError(true);
      // On failure, generate a NEW challenge question and shuffle!
      setTimeout(() => {
        resetPuzzle();
      }, 700);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center my-3 ${className}`}>
      {/* Container for Google reCAPTCHA v2 Checkbox Widget */}
      <div
        ref={containerRef}
        id="recaptcha-official-v2-container"
        style={{
          minHeight: showFallbackPuzzle ? "auto" : "78px",
          minWidth: "304px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Loading state before 3.5s timeout */}
        {!scriptLoaded && !googleFailed && !showFallbackPuzzle && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 18px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Loading security check…
          </div>
        )}

        {/* Fallback Dynamic Interactive Visual CAPTCHA Puzzle */}
        {showFallbackPuzzle && (
          <div
            style={{
              width: "100%",
              maxWidth: "320px",
              background: "var(--bg-surface)",
              border: puzzleVerified
                ? "2px solid var(--success)"
                : puzzleError
                ? "2px solid var(--danger)"
                : "1px solid var(--border)",
              borderRadius: "14px",
              padding: "14px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
              transition: "all 0.2s ease",
            }}
          >
            {!puzzleVerified ? (
              <>
                <div
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    fontSize: "0.82rem",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: "0.88rem" }}>
                    Security Verification
                  </div>
                  <div style={{ opacity: 0.95, fontSize: "0.8rem", marginTop: "2px" }}>
                    {puzzleData.topic.title}
                  </div>
                </div>

                {/* 3x3 Tile Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  {puzzleData.tiles.map((tile) => {
                    const isSelected = selectedTiles.includes(tile.id);
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => toggleTile(tile.id)}
                        style={{
                          height: "64px",
                          borderRadius: "8px",
                          border: isSelected
                            ? "3px solid #6366f1"
                            : "1px solid var(--border)",
                          background: isSelected
                            ? "rgba(99,102,241,0.18)"
                            : "var(--bg-base)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          position: "relative",
                        }}
                      >
                        <span style={{ fontSize: "1.6rem" }}>{tile.emoji}</span>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            color: "var(--text-muted)",
                            marginTop: "2px",
                          }}
                        >
                          {tile.label}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            ✅
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {puzzleError && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--danger)",
                      marginBottom: "10px",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    ❌ Incorrect. Loading new puzzle challenge…
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleVerifyPuzzle}
                  className="btn btn-primary w-full"
                  style={{ fontSize: "0.85rem", padding: "8px" }}
                >
                  Verify Selection
                </button>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "8px",
                  color: "var(--success)",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ fontSize: "1.3rem" }}>✅</span>
                Security Challenge Verified
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
