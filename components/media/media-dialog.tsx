"use client"

import { useCallback, useEffect, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MediaUploadZone } from "./media-upload-zone"
import { MediaCard } from "./media-card"
import { MediaDeleteDialog } from "./media-delete-dialog"
import {
    listMediaAction,
    countMediaAction,
} from "@/actions/media.actions"
import type { MediaRow } from "@/db/queries/media"

type MediaDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (media: MediaRow) => void
    accept?: "image" | "all"
    postId?: string
    autoCommitOnUpload?: boolean
}

export function MediaDialog({
    open,
    onOpenChange,
    onSelect,
    accept = "all",
    postId,
    autoCommitOnUpload = false,
}: MediaDialogProps) {
    const [items, setItems] = useState<MediaRow[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [selected, setSelected] = useState<MediaRow | null>(null)

    // Delete confirmation dialog state
    const [deleteTarget, setDeleteTarget] = useState<MediaRow | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const load = useCallback(
        async (selectId?: string) => {
            try {
                setLoading(true)
                const type = accept === "image" ? "image" : "all"
                const [rows, count] = await Promise.all([
                    listMediaAction({ search: query || undefined, type, limit: 60 }),
                    countMediaAction({ search: query || undefined, type }),
                ])
                const list = rows as unknown as MediaRow[]
                setItems(list)
                setTotal(count)
                if (selectId) {
                    const hit = list.find((m) => m.id === selectId)
                    if (hit) setSelected(hit)
                }
            } catch (err) {
                console.error(err)
                toast.error("Failed to load media")
            } finally {
                setLoading(false)
            }
        },
        [accept, query]
    )

    useEffect(() => {
        if (!open) {
            setSelected(null)
            setQuery("")
            setDeleteTarget(null)
            setDeleteOpen(false)
            return
        }
        load()
    }, [open, load])

    function handleConfirm() {
        if (!selected) return
        onSelect(selected)
        onOpenChange(false)
    }

    function requestDelete(media: MediaRow) {
        setDeleteTarget(media)
        setDeleteOpen(true)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Media library</DialogTitle>
                        <DialogDescription>
                            Upload new files or pick from your library.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <MediaUploadZone
                            postId={postId}
                            onUploaded={(uploaded) => {
                                const newest = uploaded[uploaded.length - 1]
                                if (!newest) return

                                if (autoCommitOnUpload) {
                                    onSelect(newest)
                                    onOpenChange(false)
                                    return
                                }

                                if (query) {
                                    setQuery("")
                                    queueMicrotask(() => load(newest.id))
                                } else {
                                    load(newest.id)
                                }
                            }}
                        />

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by filename or alt text..."
                                className="pl-9"
                            />
                        </div>

                        <div className="text-xs text-brand-muted">
                            {total} file{total === 1 ? "" : "s"}
                        </div>

                        {loading ? (
                            <div className="py-12 text-center text-sm text-brand-muted">
                                Loading...
                            </div>
                        ) : items.length === 0 ? (
                            <div className="py-12 text-center text-sm text-brand-muted">
                                No media yet — upload something above.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {items.map((m) => (
                                    <MediaCard
                                        key={m.id}
                                        media={m}
                                        selected={selected?.id === m.id}
                                        onClick={setSelected}
                                        onDelete={requestDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!selected}
                        >
                            Insert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation — sits on top of the media dialog */}
            <MediaDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                media={deleteTarget}
                onSuccess={() => {
                    if (selected?.id === deleteTarget?.id) setSelected(null)
                    load()
                }}
            />
        </>
    )
}