"use client"

import { useEffect, useMemo, useState } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    createCategoryAction,
    updateCategoryAction,
} from "@/actions/category.actions"
import type { Category } from "@/components/categories/category-tree"

type CategoryDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: Category
    parentCategories: Category[]
    onSuccess: () => void
}

const NO_PARENT = "__none__"

const categorySchema = Joi.object({
    name: Joi.string().required().min(1).max(255).messages({
        "string.empty": "Name is required",
        "string.max": "Name must be less than 255 characters",
    }),
    slug: Joi.string().required().min(1).max(255).messages({
        "string.empty": "Slug is required",
        "string.max": "Slug must be less than 255 characters",
    }),
    description: Joi.string().allow("").max(1000).messages({
        "string.max": "Description must be less than 1000 characters",
    }),
    parentId: Joi.string().allow("").optional(),
})

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

function collectDescendantIds(cat: Category | undefined, acc: Set<string>) {
    if (!cat) return
    acc.add(cat.id)
    cat.children?.forEach((c) => collectDescendantIds(c, acc))
}

export function CategoryDialog({
    open,
    onOpenChange,
    category,
    parentCategories,
    onSuccess,
}: CategoryDialogProps) {
    const isEditMode = !!category

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [slugTouched, setSlugTouched] = useState(false)
    const [description, setDescription] = useState("")
    const [parentId, setParentId] = useState<string>(NO_PARENT)

    useEffect(() => {
        if (!open) return
        setName(category?.name ?? "")
        setSlug(category?.slug ?? "")
        setDescription(category?.description ?? "")
        setParentId(category?.parent_id ?? NO_PARENT)
        setSlugTouched(!!category)
        setErrors({})
    }, [open, category])

    useEffect(() => {
        if (isEditMode) return
        if (slugTouched) return
        setSlug(slugify(name))
    }, [name, slugTouched, isEditMode])

    const blockedIds = useMemo(() => {
        const set = new Set<string>()
        collectDescendantIds(category, set)
        return set
    }, [category])

    const availableParents = useMemo(
        () => parentCategories.filter((c) => !blockedIds.has(c.id)),
        [parentCategories, blockedIds]
    )

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrors({})

        const data = {
            name,
            slug,
            description,
            parentId: parentId === NO_PARENT ? "" : parentId,
        }

        const { error, value } = categorySchema.validate(data, {
            abortEarly: false,
        })
        if (error) {
            const errorMap: Record<string, string> = {}
            error.details.forEach((detail) => {
                errorMap[detail.path[0] as string] = detail.message
            })
            setErrors(errorMap)
            toast.error("Please fix the errors below")
            return
        }

        setLoading(true)
        try {
            if (isEditMode && category) {
                await updateCategoryAction(category.id, {
                    name: value.name,
                    slug: value.slug,
                    description: value.description || undefined,
                    parentId: value.parentId || undefined,
                })
                toast.success("Category updated successfully")
            } else {
                await createCategoryAction({
                    name: value.name,
                    slug: value.slug,
                    description: value.description || undefined,
                    parentId: value.parentId || undefined,
                })
                toast.success("Category created successfully")
            }

            onOpenChange(false)
            onSuccess()
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong")
            console.error("Category action error:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit Category" : "Create Category"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update the category details below"
                            : "Add a new category to your taxonomy"}
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
                                placeholder="e.g., Technology"
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
                                placeholder="e.g., technology"
                                disabled={loading}
                                aria-invalid={!!errors.slug}
                            />
                            {errors.slug && (
                                <FieldDescription className="text-red-500">
                                    {errors.slug}
                                </FieldDescription>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="description">Description</FieldLabel>
                            <textarea
                                id="description"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description"
                                disabled={loading}
                                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                rows={3}
                            />
                            {errors.description && (
                                <FieldDescription className="text-red-500">
                                    {errors.description}
                                </FieldDescription>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="parentId">Parent Category</FieldLabel>
                            <Select
                                name="parentId"
                                value={parentId}
                                onValueChange={setParentId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="None (top-level)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NO_PARENT}>
                                        None (top-level)
                                    </SelectItem>
                                    {availableParents.map((parent) => (
                                        <SelectItem key={parent.id} value={parent.id}>
                                            {parent.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.parentId && (
                                <FieldDescription className="text-red-500">
                                    {errors.parentId}
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
                                    ? "Update Category"
                                    : "Create Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}