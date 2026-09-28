// ./proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { User } from "@/types";

type RouteConfig = {
    allowedRoles: string[];
};

const protectedRoutes: Record<string, RouteConfig> = {
    "/dashboard": { allowedRoles: ["user", "admin"] },
    "/admin": { allowedRoles: ["admin"] },
    "/moderator": { allowedRoles: ["admin", "moderator"] },
};

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const routeConfig = Object.entries(protectedRoutes).find(([route]) =>
        pathname.startsWith(route)
    )?.[1];

    if (!routeConfig) {
        return NextResponse.next();
    }

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (!routeConfig.allowedRoles.includes(session.user.role || "user")) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/admin", "/moderator"],
};