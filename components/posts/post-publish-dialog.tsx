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
import {
    publishPostAction,
    unpublishPostAction,
    restorePostAction,
} from "@/actions/post.actions"

type Action = "publish" | "unpublish" | "restore"

type Post = {
    id: string
    title: string
    scheduled_at?: number | null
}

type PostPublishDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    post?: Post
    action: Action
    onSuccess: () => void
}

const COPY: Record<
    Action,
    { title: string; description: (p?: Post) => string; cta: string; destructive?: boolean }
> = {
    publish: {
        title: "Publish post?",
        description: (p) =>
            p?.scheduled_at
                ? `"${p.title}" is currently scheduled. Publishing now will override the schedule.`
                : `"${p?.title}" will become visible on your public site.`,
        cta: "Publish",
    },
    unpublish: {
        title: "Unpublish post?",
        description: (p) =>
            `"${p?.title}" will be hidden from your public site. It stays in your drafts.`,
        cta: "Unpublish",
        destructive: true,
    },
    restore: {
        title: "Restore post?",
        description: (p) =>
            `"${p?.title}" will be restored from trash. It will still be a draft until you publish it.`,
        cta: "Restore",
    },
}

export function PostPublishDialog({
    open,
    onOpenChange,
    post,
    action,
    onSuccess,
}: PostPublishDialogProps) {
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) setLoading(false)
    }, [open, post, action])

    async function handleConfirm() {
        if (!post) return
        setLoading(true)
        try {
            if (action === "publish") await publishPostAction(post.id)
            else if (action === "unpublish") await unpublishPostAction(post.id)
            else if (action === "restore") await restorePostAction(post.id)

            toast.success(
                action === "publish"
                    ? "Post published"
                    : action === "unpublish"
                        ? "Post unpublished"
                        : "Post restored"
            )
            onOpenChange(false)
            onSuccess()
        } catch (err: any) {
            toast.error(err?.message || "Action failed")
        } finally {
            setLoading(false)
        }
    }

    const copy = COPY[action]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{copy.title}</DialogTitle>
                    <DialogDescription>{copy.description(post)}</DialogDescription>
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
                        variant={copy.destructive ? "destructive" : "default"}
                        onClick={handleConfirm}
                        disabled={loading || !post}
                    >
                        {loading ? "Working..." : copy.cta}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}