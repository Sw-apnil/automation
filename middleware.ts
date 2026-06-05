import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/cron")) return NextResponse.next();

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return unauthorized();

  const decoded = atob(auth.replace("Basic ", ""));
  const [providedUser, providedPassword] = decoded.split(":");
  if (providedUser !== username || providedPassword !== password) return unauthorized();

  return NextResponse.next();
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Football Automation"' }
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"]
};
