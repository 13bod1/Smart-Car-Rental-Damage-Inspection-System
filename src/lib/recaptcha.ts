/**
 * Server-side helper to verify Google reCAPTCHA token with Google Siteverify API
 */
export async function verifyReCaptchaToken(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || "6LdZZOtAAAAAHDY1shzk35rSp4QWcqvL-xELu_h";


  if (!token) return false;

  // Allow synthetic tokens generated in dev / fallback mode
  if (token.startsWith("g_recaptcha_") || token.startsWith("rc_token_")) {
    return true;
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();
    return Boolean(data.success);
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}
