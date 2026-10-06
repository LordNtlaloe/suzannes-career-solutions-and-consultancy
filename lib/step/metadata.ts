import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStepCanonicalUrl } from "@/lib/step/config";

/**
 * Build metadata for a STEP page with a canonical URL that flips between the
 * /step path and the future step.<domain> host automatically.
 */
export async function stepPageMetadata(opts: {
    path: string;
    title: string;
    description: string;
    noIndex?: boolean;
}): Promise<Metadata> {
    const host = (await headers()).get("host") ?? "";
    const canonical = getStepCanonicalUrl(host, opts.path);

    return {
        title: opts.title,
        description: opts.description,
        openGraph: {
            title: opts.title,
            description: opts.description,
        },
        alternates: { canonical },
        // While only the /step path exists it is the canonical copy. Once
        // NEXT_PUBLIC_STEP_BASE_URL points at the subdomain, /step pages are
        // noindexed so the subdomain becomes the single indexed copy.
        robots: {
            index: !opts.noIndex && !process.env.NEXT_PUBLIC_STEP_BASE_URL,
            follow: !opts.noIndex,
        },
    };
}
