import {
  NextRequest,
  NextResponse,
} from "next/server";

export default function proxy(
  request: NextRequest,
) {
  const pathname =
    request.nextUrl.pathname;

  const locale =
    pathname === "/en" ||
    pathname.startsWith("/en/")
      ? "en"
      : "fa";

  const requestHeaders =
    new Headers(request.headers);

  requestHeaders.set(
    "x-appkhor-locale",
    locale,
  );

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
