import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Basic middleware - admin protection is handled in the page components
  // For full auth middleware, you'd need to check the session here
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
