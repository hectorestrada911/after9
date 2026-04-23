export function mapAuthCallbackError(raw: string | null): string | null {
  if (!raw) return null;
  if (raw === "session") return "Your sign-in link expired or was already used. Log in with your password.";
  if (raw === "missing_token") return "That login link is incomplete. Request a new email or log in with your password.";
  if (raw === "config") return "Auth is not configured yet. Please contact support.";
  const msg = safeDecode(raw).toLowerCase();
  if (msg.includes("otp_expired")) return "Your email link expired. Request a fresh one.";
  if (msg.includes("access_denied")) return "That login request was denied. Try again.";
  return safeDecode(raw);
}

export function mapAuthActionError(raw: string, flow: "login" | "signup" | "reset"): string {
  const msg = raw.toLowerCase();
  if (msg.includes("invalid login credentials")) return "Incorrect email or password.";
  if (msg.includes("email not confirmed")) {
    if (flow === "signup") return "This email is already registered but not confirmed yet. Check your inbox for the verification email.";
    return "Email not verified yet. Check your inbox and click the verification link before logging in.";
  }
  if (msg.includes("user already registered")) return "An account with this email already exists. Try logging in instead.";
  if (msg.includes("password should be at least")) return "Password is too short. Use at least 8 characters.";
  if (msg.includes("same password")) return "Choose a different password than your current one.";
  if (msg.includes("too many requests")) return "Too many attempts right now. Wait a minute, then try again.";
  if (msg.includes("rate limit")) return "Too many requests. Please wait and try again.";
  if (msg.includes("signup is disabled")) return "New signups are temporarily disabled.";
  if (msg.includes("invalid email")) return "Please enter a valid email address.";
  return raw;
}

function safeDecode(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
