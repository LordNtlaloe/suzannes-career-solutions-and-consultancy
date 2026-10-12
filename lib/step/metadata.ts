import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStepCanonicalUrl } from "@/lib/step/config";

/**
 * Build metadata for a STEP page. STEP is served at the site root, so the
 * canonical URL is simply `https://<host><path>`.
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
        robots: {
            index: !opts.noIndex,
            follow: !opts.noIndex,
        },
    };
}
