import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/event-draft";

/**
 * Supabase redirects here after magic-link / OTP email (PKCE `code`, or legacy `token_hash`).
 * Session cookies are set on the redirect response, then `/auth/complete` picks the final path.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const err = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  if (err) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err)}`, request.url));
  }

  const next = safeNextPath(url.searchParams.get("next"));
  const postAuthUrl = (() => {
    if (type === "recovery") return new URL("/auth/reset-password", url.origin);
    const complete = new URL("/auth/complete", url.origin);
    complete.searchParams.set("next", next);
    return complete;
  })();

  let response = NextResponse.redirect(postAuthUrl);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    }
    return response;
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    }
    return response;
  }

  return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
}
