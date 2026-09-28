"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteMediaAction } from "@/actions/media.actions"
import type { MediaRow } from "@/db/queries/media"

type MediaDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    media?: MediaRow | null
    onSuccess?: () => void
}

export function MediaDeleteDialog({
    open,
    onOpenChange,
    media,
    onSuccess,
}: MediaDeleteDialogProps) {
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) setLoading(false)
    }, [open, media])

    async function handleDelete() {
        if (!media) return
        setLoading(true)
        try {
            await deleteMediaAction(media.id)
            toast.success("File deleted")
            onOpenChange(false)
            onSuccess?.()
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete file")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete file?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <span className="font-semibold">
                            {media?.file_name ?? "This file"}
                        </span>{" "}
                        will be permanently removed from storage and cannot be
                        recovered.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={loading || !media}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}