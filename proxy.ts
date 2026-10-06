// ./proxy.ts
//
// Request-time routing and guards:
//
//  1. Validates the request hostname against an explicit allowlist (when set).
//  2. Serves the STEP module from step.<domain> by rewriting clean paths
//     (/, /apply, /dashboard, /admin, …) into the /step namespace. On the main
//     domain STEP remains at /step/* — no rewrite happens there.
//  3. Guards protected routes based on the *effective* path, so permissions
//     hold regardless of whether the request arrives on the main host or the
//     STEP subdomain.
//
// STEP subdomain routing is only active once STEP_SUBDOMAINS (and optionally
// APP_HOSTNAMES) are configured. Until then this proxy behaves exactly like a
// path-based guard.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
    isAllowedHost,
    isStepHost,
    normalizeHost,
} from "@/lib/step/config";
import { STEP_PATH } from "@/lib/step/constants";

type RouteConfig = {
    allowedRoles?: string[];
    requireAuth?: boolean;
};

const protectedRoutes: Record<string, RouteConfig> = {
    // Existing blog dashboard & staff areas (unchanged behaviour).
    "/dashboard": { allowedRoles: ["user", "admin"] },
    "/admin": { allowedRoles: ["admin"] },
    "/moderator": { allowedRoles: ["admin", "moderator"] },
    // STEP module. Programme administration is authorised server-side against
    // step_staff (scoped, independent of blog roles); the proxy only enforces
    // authentication so the same guard holds on any hostname.
    "/step/admin": { requireAuth: true },
    "/step/dashboard": { requireAuth: true },
};

export async function proxy(request: NextRequest) {
    const host = normalizeHost(request.headers.get("host") ?? "");
    const pathname = request.nextUrl.pathname;

    // 1. Hostname validation (disabled until allowlists are configured).
    if (!isAllowedHost(host)) {
        return new NextResponse("Not Found", { status: 404 });
    }

    // 2. Map subdomain requests into the /step namespace for permission checks.
    const stepHost = isStepHost(host);
    let effectivePath = pathname;
    if (stepHost && !pathname.startsWith(STEP_PATH)) {
        effectivePath =
            pathname === "/" ? STEP_PATH : `${STEP_PATH}${pathname}`;
    }

    // 3. Route protection on the effective path.
    const routeConfig = Object.entries(protectedRoutes).find(([route]) =>
        effectivePath.startsWith(route),
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

    // 4. Rewrite STEP-subdomain requests into the /step namespace.
    if (stepHost && !pathname.startsWith(STEP_PATH)) {
        const url = request.nextUrl.clone();
        url.pathname = effectivePath;
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    // Run for all page requests, but skip API routes, Next internals and
    // static assets so the rewrite/guards never touch them.
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};