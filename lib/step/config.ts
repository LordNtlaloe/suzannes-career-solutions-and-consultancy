// lib/step/config.ts
//
// Hostname detection, base-path and canonical URL helpers for the STEP module.
//
// STEP is served under /step on the main domain today and will later be served
// from step.<domain> at clean paths (/, /apply, /dashboard, …). The proxy
// (./proxy.ts) rewrites step-host requests into the /step namespace internally,
// so this module only needs to know two things:
//
//   1. Which hostname is the STEP host  (isStepHost)
//   2. What URL prefix STEP links should use (stepBasePath / stepPath)
//
// Configuration is explicit and environment-driven to avoid accidental
// rewrites or duplicate indexed copies:
//
//   STEP_SUBDOMAINS   comma-separated hostnames that serve STEP (e.g. step.example.com)
//   APP_HOSTNAMES     comma-separated hostnames that serve the main blog
//                     (optional; when set, unknown hosts are rejected in proxy.ts)
//   NEXT_PUBLIC_STEP_BASE_URL  canonical base for STEP (https://step.example.com)
//
// Until these are set, only /step mode is active.

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

export function getStepHostnames(): string[] {
    return splitHostnames(
        process.env.STEP_SUBDOMAINS || process.env.STEP_SUBDOMAIN,
    );
}

export function getMainHostnames(): string[] {
    return splitHostnames(process.env.APP_HOSTNAMES);
}

/** True when `host` is a configured STEP hostname. */
export function isStepHost(host: string): boolean {
    const stepHosts = getStepHostnames();
    if (stepHosts.length === 0) return false;
    return stepHosts.includes(normalizeHost(host));
}

/** True when `host` is allowed to reach the application at all. */
export function isAllowedHost(host: string): boolean {
    const main = getMainHostnames();
    const step = getStepHostnames();
    if (main.length === 0 && step.length === 0) return true; // validation disabled
    return [...main, ...step].includes(normalizeHost(host));
}

/** URL prefix for STEP routes: "" on the STEP host, "/step" otherwise. */
export function stepBasePath(host: string): string {
    return isStepHost(host) ? "" : STEP_PATH;
}

/** Build a STEP path for links: stepPath("/apply") → "/step/apply" or "/apply". */
export function stepPath(host: string, path: string): string {
    const base = stepBasePath(host);
    const p = path.startsWith("/") ? path : `/${path}`;
    if (p === "/") return base || "/";
    return `${base}${p}`;
}

/** Absolute canonical URL for a STEP route. */
export function getStepCanonicalUrl(host: string, path: string): string {
    const base = process.env.NEXT_PUBLIC_STEP_BASE_URL;
    const p = path.startsWith("/") ? path : `/${path}`;
    if (base) {
        return `${base.replace(/\/$/, "")}${p === "/" ? "" : p}`;
    }
    // No canonical subdomain configured yet: canonical is the /step path on this host.
    return `https://${normalizeHost(host)}${stepPath(host, p)}`;
}
