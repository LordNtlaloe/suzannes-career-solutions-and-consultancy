// lib/media/upload.ts

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB

export const ALLOWED_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/svg+xml",
    "application/pdf",
    "video/mp4",
    "video/webm",
])

export function isAllowed(mime: string) {
    return ALLOWED_MIME.has(mime)
}

export function sanitizeFileName(name: string) {
    const base = name.split(/[\\/]/).pop() ?? ""
    const safe = base
        .replace(/[^\w.\- ]+/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()

    return safe || "file"
}

/**
 * Builds a unique object key: yyyy/mm/<uuid>-<sanitized-name>
 */
export function buildKey(originalName: string) {
    const now = new Date()
    const yyyy = now.getUTCFullYear()
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
    const uuid = crypto.randomUUID()
    const safe = sanitizeFileName(originalName)

    return `${yyyy}/${mm}/${uuid}-${safe}`
}