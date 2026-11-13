"use client";

import { ReCaptcha } from "./ReCaptcha";

interface TurnstileProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "dark" | "light";
  className?: string;
}

/**
 * Turnstile wrapper aliased directly to ReCaptcha for 100% Google reCAPTCHA v2 execution
 */
export function Turnstile(props: TurnstileProps) {
  return <ReCaptcha {...props} theme="dark" />;
}
