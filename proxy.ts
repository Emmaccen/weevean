import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/auth/login", "/auth/register"];
export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.includes(pathname);

  if (!sessionCookie && !isPublic) {
    const url = new URL("/auth/login", request.url);
    // Add the callbackUrl to the redirect URL
    url.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
