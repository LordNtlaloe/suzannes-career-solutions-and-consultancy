/**
 * Very rough reading-time estimate: 200 wpm.
 * Assumes `content` is HTML; strips tags first.
 */
export function getReadingMinutes(html: string): number {
    const text = html
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<\/?[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()

    const words = text ? text.split(" ").length : 0
    return Math.max(1, Math.round(words / 200))
}