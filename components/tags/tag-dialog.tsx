"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import Joi from "joi"
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
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createTagAction, updateTagAction } from "@/actions/tag.actions"

export type Tag = {
    id: string
    name: string
    slug: string
    post_count?: number
}

type TagDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    tag?: Tag
    onSuccess: () => void
}

const tagSchema = Joi.object({
    name: Joi.string().required().min(1).max(100).messages({
        "string.empty": "Name is required",
        "string.max": "Name must be less than 100 characters",
    }),
    slug: Joi.string().required().min(1).max(100).messages({
        "string.empty": "Slug is required",
        "string.max": "Slug must be less than 100 characters",
    }),
})

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

export function TagDialog({
    open,
    onOpenChange,
    tag,
    onSuccess,
}: TagDialogProps) {
    const isEditMode = !!tag

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [slugTouched, setSlugTouched] = useState(false)

    useEffect(() => {
        if (!open) return
        setName(tag?.name ?? "")
        setSlug(tag?.slug ?? "")
        setSlugTouched(!!tag)
        setErrors({})
    }, [open, tag])

    useEffect(() => {
        if (isEditMode) return
        if (slugTouched) return
        setSlug(slugify(name))
    }, [name, slugTouched, isEditMode])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrors({})

        const { error, value } = tagSchema.validate(
            { name, slug },
            { abortEarly: false }
        )
        if (error) {
            const errorMap: Record<string, string> = {}
            error.details.forEach((d) => {
                errorMap[d.path[0] as string] = d.message
            })
            setErrors(errorMap)
            toast.error("Please fix the errors below")
            return
        }

        setLoading(true)
        try {
            if (isEditMode && tag) {
                await updateTagAction(tag.id, value)
                toast.success("Tag updated successfully")
            } else {
                await createTagAction(value)
                toast.success("Tag created successfully")
            }
            onOpenChange(false)
            onSuccess()
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong")
            console.error("Tag action error:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-110">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit Tag" : "Create Tag"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update the tag details below"
                            : "Add a new tag to your blog"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <FieldGroup className="gap-4">
                        <Field>
                            <FieldLabel htmlFor="name">Name *</FieldLabel>
                            <Input
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., React"
                                disabled={loading}
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && (
                                <FieldDescription className="text-red-500">
                                    {errors.name}
                                </FieldDescription>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="slug">Slug *</FieldLabel>
                            <Input
                                id="slug"
                                name="slug"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value)
                                    setSlugTouched(true)
                                }}
                                placeholder="e.g., react"
                                disabled={loading}
                                aria-invalid={!!errors.slug}
                            />
                            {errors.slug && (
                                <FieldDescription className="text-red-500">
                                    {errors.slug}
                                </FieldDescription>
                            )}
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Tag"
                                    : "Create Tag"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}