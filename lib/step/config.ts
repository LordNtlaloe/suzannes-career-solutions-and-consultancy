// lib/step/config.ts
//
// Hostname, base-path and canonical URL helpers for the STEP module.
//
// STEP is hosted at the site root: the programme homepage is `/`, apply is
// `/apply`, the dashboards are `/dashboard/*` and administration is `/admin`.
// Links are therefore always built against an empty base path, and canonical
// URLs are simply `https://<host><path>`.
//
//   APP_HOSTNAMES  comma-separated hostnames allowed to serve the application
//                  (optional; when set, unknown hosts are rejected in proxy.ts)

import { STEP_PATH } from "@/lib/step/constants";

function splitHostnames(value: string | undefined): string[] {
    if (!value) return [];
    return value
        .split(",")
        .map((h) => normalizeHost(h))
        .filter(Boolean);
}

/** Lowercase and strip any port from a Host header value. */
export function normalizeHost(host: string): string {
    return host.trim().toLowerCase().replace(/:\d+$/, "");
}

export function getMainHostnames(): string[] {
    return splitHostnames(process.env.APP_HOSTNAMES);
}

/** True when `host` is allowed to reach the application at all. */
export function isAllowedHost(host: string): boolean {
    const main = getMainHostnames();
    if (main.length === 0) return true; // validation disabled
    return main.includes(normalizeHost(host));
}

/** URL prefix for STEP routes: "" because STEP is served at the root. */
export function stepBasePath(host: string): string {
    return STEP_PATH;
}

/** Build a STEP path for links: stepPath("/apply") → "/apply". */
export function stepPath(host: string, path: string): string {
    const base = stepBasePath(host);
    const p = path.startsWith("/") ? path : `/${path}`;
    if (p === "/") return base || "/";
    return `${base}${p}`;
}

/** Absolute canonical URL for a STEP route. */
export function getStepCanonicalUrl(host: string, path: string): string {
    const p = path.startsWith("/") ? path : `/${path}`;
    return `https://${normalizeHost(host)}${p === "/" ? "" : p}`;
}
