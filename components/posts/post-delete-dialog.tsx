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
import { softDeletePostAction } from "@/actions/post.actions"

type Post = {
    id: string
    title: string
}

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    post?: Post
    onSuccess: () => void
}

export function PostDeleteDialog({ open, onOpenChange, post, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) setLoading(false)
    }, [open, post])

    async function handleDelete() {
        if (!post) return
        setLoading(true)
        try {
            await softDeletePostAction(post.id)
            toast.success("Post moved to trash")
            onOpenChange(false)
            onSuccess()
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete post")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete post?</DialogTitle>
                    <DialogDescription>
                        <span className="font-semibold">{post?.title}</span> will be moved
                        to trash. You can restore it later from the archived view.
                    </DialogDescription>
                </DialogHeader>

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
                        disabled={loading || !post}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}