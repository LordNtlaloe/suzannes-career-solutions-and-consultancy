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
import { deleteCategoryAction } from "@/actions/category.actions"

type Category = {
    id: string
    name: string
}

type CategoryDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: Category
    onSuccess: () => void
}

export function CategoryDeleteDialog({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryDeleteDialogProps) {
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) setLoading(false)
    }, [open, category])

    async function handleDelete() {
        if (!category) return

        setLoading(true)
        try {
            await deleteCategoryAction(category.id)
            toast.success("Category deleted successfully")
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete category")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Category</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{category?.name}</span>?
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-brand-muted">
                    This action cannot be undone. All subcategories and their
                    associations will be affected.
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
                        disabled={loading || !category}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}