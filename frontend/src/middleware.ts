import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Only refresh the JWT on routes that need server auth. Calling `getUser()` on every navigation
  // (marketing pages, event detail, etc.) adds a round-trip before RSC can render and feels slow.
  const pathname = request.nextUrl.pathname;
  const authRefreshPrefixes = ["/dashboard", "/account", "/my-tickets", "/onboarding", "/create-event", "/checkout", "/auth"];
  const shouldRefreshAuth = authRefreshPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (shouldRefreshAuth) {
    try {
      await supabase.auth.getUser();
    } catch {
      // Ignore refresh failures; downstream routes can still read existing cookies/session.
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
