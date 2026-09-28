"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { deleteTagAction } from "@/actions/tag.actions"

type Tag = {
    id: string
    name: string
}

type TagDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    tag?: Tag
    onSuccess: () => void
}

export function TagDeleteDialog({
    open,
    onOpenChange,
    tag,
    onSuccess,
}: TagDeleteDialogProps) {
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) setLoading(false)
    }, [open, tag])

    async function handleDelete() {
        if (!tag) return
        setLoading(true)
        try {
            await deleteTagAction(tag.id)
            toast.success("Tag deleted successfully")
            onOpenChange(false)
            onSuccess()
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete tag")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Tag</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{tag?.name}</span>?
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-brand-muted">
                    This action cannot be undone. Posts using this tag will lose
                    the association, but the posts themselves will not be
                    deleted.
                </p>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading || !tag}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}