"use client"

import { useCallback, useRef, useState } from "react"
import { UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { uploadMediaAction } from "@/actions/media.actions"
import { MAX_UPLOAD_BYTES } from "@/lib/media/upload"
import type { MediaRow } from "@/db/queries/media"
import { cn } from "@/lib/utils"

type Props = {
    /** Called with the rows that were successfully uploaded (in order). */
    onUploaded?: (uploaded: MediaRow[]) => void
    postId?: string
    className?: string
    compact?: boolean
}

export function MediaUploadZone({ onUploaded, postId, className, compact }: Props) {
    const [dragging, setDragging] = useState(false)
    const [busy, setBusy] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const uploadFiles = useCallback(
        async (files: FileList | File[]) => {
            const list = Array.from(files)
            if (list.length === 0) return

            setBusy(true)
            const uploaded: MediaRow[] = []
            let failed = 0

            for (const file of list) {
                if (file.size > MAX_UPLOAD_BYTES) {
                    toast.error(`${file.name} is too large`)
                    failed++
                    continue
                }
                const fd = new FormData()
                fd.append("file", file)
                if (postId) fd.append("postId", postId)
                try {
                    const row = await uploadMediaAction(fd)
                    if (row) uploaded.push(row as unknown as MediaRow)
                } catch (err: any) {
                    toast.error(`${file.name}: ${err?.message ?? "upload failed"}`)
                    failed++
                }
            }

            setBusy(false)
            if (uploaded.length > 0) {
                toast.success(
                    `${uploaded.length} file${uploaded.length === 1 ? "" : "s"} uploaded${failed ? `, ${failed} failed` : ""}`
                )
                onUploaded?.(uploaded)
            } else if (failed > 0) {
                toast.error("Upload failed")
            }
        },
        [onUploaded, postId]
    )

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                uploadFiles(e.dataTransfer.files)
            }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
            }}
            className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
                compact ? "px-4 py-4" : "px-6 py-10",
                dragging ? "border-blue-dark bg-blue/5" : "border-line hover:border-ink/30",
                busy && "opacity-60 pointer-events-none",
                className
            )}
        >
            <UploadCloud className={cn("text-brand-muted", compact ? "h-5 w-5" : "h-8 w-8")} />
            <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
                {busy ? "Uploading..." : "Click to upload or drag & drop"}
            </p>
            {!compact && (
                <p className="text-xs text-brand-muted">
                    PNG, JPG, WEBP, GIF, PDF, MP4 — up to {Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB
                </p>
            )}

            <input
                ref={inputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                    if (e.target.files) uploadFiles(e.target.files)
                    e.target.value = ""
                }}
            />
        </div>
    )
}