import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    return [
        { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
        { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${baseUrl}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${baseUrl}/posts`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
        // STEP programme (served under /step until step.<domain> goes live).
        { url: `${baseUrl}/step`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${baseUrl}/step/apply`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ];
}
