import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/.well-known/farcaster.json") {
    return NextResponse.rewrite(new URL("/api/farcaster-manifest", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/.well-known/:path*"],
};