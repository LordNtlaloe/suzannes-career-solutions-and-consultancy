import type { MetadataRoute } from "next";

const SITE_URL = "https://step.co.ls";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: `${SITE_URL}/` },
        { url: `${SITE_URL}/apply` },
        { url: `${SITE_URL}/about` },
        { url: `${SITE_URL}/services` },
        { url: `${SITE_URL}/contact` },
        { url: `${SITE_URL}/news` },
    ];
}