import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Add paths that require authentication
  const protectedPaths = ["/game", "/explore"];

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((pp) => path.startsWith(pp));

  // Get authentication status from cookie
  const isAuthenticated =
    request.cookies.get("authenticated")?.value === "true";

  if (isProtectedPath && !isAuthenticated) {
    // Redirect to home page with return URL
    const url = new URL("/", request.url);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/game/:path*",
    // Add other protected paths here
    "/explore/:path*",
  ],
};
