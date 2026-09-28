"use client"

import { Check, FileText, Video, ImageIcon, MoreVertical, Trash2 } from "lucide-react"
import type { MediaRow } from "@/db/queries/media"
import { cn } from "@/lib/utils"

type MediaCardProps = {
    media: MediaRow
    selected?: boolean
    onClick?: (media: MediaRow) => void
    onDelete?: (media: MediaRow) => void
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function MediaCard({ media, selected, onClick, onDelete }: MediaCardProps) {
    const isImg = media.file_type.startsWith("image/")
    const isVid = media.file_type.startsWith("video/")
    const isPdf = media.file_type === "application/pdf"

    const preview = media.thumbnail_url ?? media.url

    return (
        <div
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-md border border-line bg-white transition-all",
                "hover:border-ink/30",
                selected && "ring-2 ring-primary border-primary",
                onClick && "cursor-pointer"
            )}
            onClick={() => onClick?.(media)}
        >
            <div className="aspect-square w-full bg-light overflow-hidden flex items-center justify-center">
                {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={preview}
                        alt={media.alt_text ?? media.file_name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : isVid ? (
                    <Video className="h-8 w-8 text-brand-muted" />
                ) : isPdf ? (
                    <FileText className="h-8 w-8 text-brand-muted" />
                ) : (
                    <ImageIcon className="h-8 w-8 text-brand-muted" />
                )}
            </div>

            <div className="flex flex-col gap-0.5 p-2 text-xs">
                <span className="font-medium truncate">{media.file_name}</span>
                <span className="text-brand-muted">
                    {formatBytes(media.file_size)}
                    {media.width && media.height && (
                        <> · {media.width}×{media.height}</>
                    )}
                </span>
            </div>

            {selected && (
                <div className="absolute right-2 top-2 rounded-full bg-blue-dark p-1 text-white shadow">
                    <Check className="h-3 w-3" />
                </div>
            )}

            {onDelete && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(media)
                    }}
                    className="absolute left-2 top-2 rounded-full bg-light/80 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all shadow"
                    aria-label="Delete"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            )}
        </div>
    )
}