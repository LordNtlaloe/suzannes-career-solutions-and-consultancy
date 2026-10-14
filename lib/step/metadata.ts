import type { Metadata } from "next";

const SITE_URL = new URL("https://step.co.ls");

export async function stepPageMetadata(opts: {
    path: string;
    title: string;
    description: string;
    noIndex?: boolean;
}): Promise<Metadata> {
    const canonical = new URL(opts.path, SITE_URL).toString();
    const indexable = !opts.noIndex;

    return {
        metadataBase: SITE_URL,
        title: opts.title,
        description: opts.description,
        alternates: {
            canonical,
        },
        robots: {
            index: indexable,
            follow: indexable,
        },
        openGraph: {
            title: opts.title,
            description: opts.description,
            url: canonical,
            siteName: "STEP Lesotho",
            locale: "en_LS",
            type: "website",
        },
        twitter: {
            card: "summary",
            title: opts.title,
            description: opts.description,
        },
    };
}