import createMiddleware from "next-intl/middleware";
import {NextRequest, NextResponse} from "next/server";
import {routing} from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;
  if (request.cookies.get("NEXT_LOCALE")?.value === "en" && !pathname.startsWith("/en")) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }
  return handleI18nRouting(request);
}

export const config = {matcher: "/((?!api|_next|.*\\..*).*)"};
