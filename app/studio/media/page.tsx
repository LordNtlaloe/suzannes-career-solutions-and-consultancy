"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ImageIcon, Search, HardDrive, Video, FileText, Images } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { SectionCards } from "@/components/section-cards"
import { MediaCard } from "@/components/media/media-card"
import { MediaUploadZone } from "@/components/media/media-upload-zone"
import {
    listMediaAction,
    countMediaAction,
    getMediaStatsAction,
    deleteMediaAction,
} from "@/actions/media.actions"
import type { MediaRow } from "@/db/queries/media"
import { cn } from "@/lib/utils"

type Filter = "all" | "image" | "video" | "document"

function formatBytes(bytes: number) {
    if (!bytes) return "0 B"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export default function MediaPage() {
    const [items, setItems] = useState<MediaRow[]>([])
    const [total, setTotal] = useState(0)
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [filter, setFilter] = useState<Filter>("all")

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const [rows, count, s] = await Promise.all([
                listMediaAction({
                    search: query || undefined,
                    type: filter,
                    limit: 200,
                }),
                countMediaAction({ search: query || undefined, type: filter }),
                getMediaStatsAction(),
            ])
            setItems(rows as unknown as MediaRow[])
            setTotal(count)
            setStats(s)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load media")
        } finally {
            setLoading(false)
        }
    }, [query, filter])

    useEffect(() => {
        load()
    }, [load])

    const tabs = useMemo(
        () => [
            { key: "all" as const, label: "All" },
            { key: "image" as const, label: "Images" },
            { key: "video" as const, label: "Videos" },
            { key: "document" as const, label: "Documents" },
        ],
        []
    )

    async function handleDelete(media: MediaRow) {
        if (!confirm(`Delete "${media.file_name}"?`)) return
        try {
            await deleteMediaAction(media.id)
            toast.success("Deleted")
            load()
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete")
        }
    }

    return (
        <div className="flex flex-col gap-6 px-3 py-4">
            {/* Header */}
            <div className="px-1">
                <h1 className="text-3xl font-bold">Media</h1>
                <p className="text-brand-muted">
                    Upload and manage images, videos, and documents
                </p>
            </div>

            {/* Stats */}
            <SectionCards
                cards={[
                    {
                        label: "Total Files",
                        value: stats?.total ?? 0,
                        icon: HardDrive,
                        footerTitle: "All uploaded media",
                        footerDescription: "Across every type",
                    },
                    {
                        label: "Storage Used",
                        value: formatBytes(stats?.total_bytes ?? 0),
                        icon: Images,
                        footerTitle: "Total size on disk",
                        footerDescription: "Sum of all file sizes",
                    },
                    {
                        label: "Images",
                        value: stats?.images ?? 0,
                        icon: ImageIcon,
                        footerTitle: "Image files",
                        footerDescription: "PNG, JPG, WEBP, etc.",
                    },
                    {
                        label: "Videos & Docs",
                        value:
                            Number(stats?.videos ?? 0) + Number(stats?.documents ?? 0),
                        icon: Video,
                        footerTitle: "Non-image media",
                        footerDescription: "Videos and documents",
                    },
                ]}
            />

            {/* Upload */}
            <div className="px-1">
                <MediaUploadZone onUploaded={load} />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap px-1">
                <div className="flex items-center gap-1 border-b overflow-x-auto">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setFilter(t.key)}
                            className={cn(
                                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                                filter === t.key
                                ? "border-blue-dark text-ink"
                                : "border-transparent text-brand-muted hover:text-ink"
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="relative max-w-sm w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search media..."
                        className="pl-8"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="rounded-lg border border-line bg-white p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-brand-muted">Loading media...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <ImageIcon className="h-10 w-10 text-brand-muted" />
                        <p className="text-brand-muted">
                            {query ? `No media matches "${query}"` : "No media yet"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {items.map((m) => (
                            <MediaCard
                                key={m.id}
                                media={m}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Count */}
            {!loading && items.length > 0 && (
                <p className="px-1 text-xs text-brand-muted">
                    Showing {items.length} of {total}
                </p>
            )}
        </div>
    )
}