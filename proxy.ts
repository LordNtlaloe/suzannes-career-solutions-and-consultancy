// ./proxy.ts
//
// Request-time routing and guards:
//
//  1. Validates the request hostname against an explicit allowlist (when set).
//  2. Guards protected routes based on the request path.
//
// STEP is hosted at the site root: `/` is the programme homepage, `/apply` is
// registration, `/dashboard` is the participant/staff dashboard and `/admin`
// is programme administration. STEP authorisation is performed server-side
// against step_staff (scoped, independent of blog roles); the proxy only
// enforces authentication. The blog CMS dashboard has been relocated to
// `/studio`.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAllowedHost, normalizeHost } from "@/lib/step/config";

type RouteConfig = {
    allowedRoles?: string[];
    requireAuth?: boolean;
};

const protectedRoutes: Record<string, RouteConfig> = {
    // Blog CMS (relocated from /dashboard).
    "/studio": { allowedRoles: ["user", "admin"] },
    // STEP programme administration. Authorisation is checked server-side
    // against step_staff; the proxy only enforces authentication.
    "/admin": { requireAuth: true },
    // STEP participant/staff dashboard.
    "/dashboard": { requireAuth: true },
};

export async function proxy(request: NextRequest) {
    const host = normalizeHost(request.headers.get("host") ?? "");
    const pathname = request.nextUrl.pathname;

    // 1. Hostname validation (disabled until APP_HOSTNAMES is configured).
    if (!isAllowedHost(host)) {
        return new NextResponse("Not Found", { status: 404 });
    }

    // 2. Route protection on the request path.
    const routeConfig = Object.entries(protectedRoutes).find(([route]) =>
        pathname.startsWith(route),
    )?.[1];

    if (routeConfig) {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            const signIn = new URL("/sign-in", request.url);
            signIn.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(signIn);
        }

        if (
            routeConfig.allowedRoles &&
            !routeConfig.allowedRoles.includes(session.user.role || "user")
        ) {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Run for all page requests, but skip API routes, Next internals and
    // static assets so the guards never touch them.
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};