import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isAdmin = request.cookies.get("physique_admin")?.value === "1";
  const isLoginAttempt = request.method === "POST";

  if (isAdmin || isLoginAttempt) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
