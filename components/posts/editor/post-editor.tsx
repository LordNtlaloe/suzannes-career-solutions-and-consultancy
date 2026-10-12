"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Save, Sparkles, Calendar, ImageIcon, X } from "lucide-react"
import Joi from "joi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CategorySelect } from "@/components/categories/category-select"
import { TagSelect, type Tag } from "@/components/tags/tag-select"
import { MediaDialog } from "@/components/media/media-dialog"
import { TiptapEditor } from "./tiptap-editor"
import {
    createPostAction,
    updatePostAction,
    publishPostAction,
    unpublishPostAction,
} from "@/actions/post.actions"
import { getMediaByIdAction } from "@/actions/media.actions"
import type { MediaRow } from "@/db/queries/media"

export type PostEditorValues = {
    id?: string
    title: string
    slug: string
    content: string
    excerpt: string
    categoryId: string | null
    coverImageId: string | null
    tags: Tag[]
    published: boolean
    scheduledAt: number | null
}

type PostEditorProps = {
    initial?: Partial<PostEditorValues>
    mode: "create" | "edit"
    onCancel: () => void
    onSaved: (id: string) => void
}

const schema = Joi.object({
    title: Joi.string().required().min(1).max(255).messages({
        "string.empty": "Title is required",
    }),
    slug: Joi.string().required().min(1).max(255).messages({
        "string.empty": "Slug is required",
    }),
    content: Joi.string().required().min(1).messages({
        "string.empty": "Content is required",
    }),
    excerpt: Joi.string().allow("").max(500),
})

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

function htmlToExcerpt(html: string, max = 200) {
    const text = html
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<\/?[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim()
    if (text.length <= max) return text
    return text.slice(0, max).replace(/\s+\S*$/, "") + "…"
}

type PublishMode = "draft" | "now" | "scheduled"

export function PostEditor({ initial, mode, onCancel, onSaved }: PostEditorProps) {
    const [title, setTitle] = useState(initial?.title ?? "")
    const [slug, setSlug] = useState(initial?.slug ?? "")
    const [slugTouched, setSlugTouched] = useState(!!initial?.slug)
    const [content, setContent] = useState(initial?.content ?? "")
    const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "")
    const [excerptTouched, setExcerptTouched] = useState(!!initial?.excerpt)
    const [categoryId, setCategoryId] = useState<string | null>(
        initial?.categoryId ?? null
    )
    const [tags, setTags] = useState<Tag[]>(initial?.tags ?? [])
    const [published, setPublished] = useState(initial?.published ?? false)

    // Cover media
    const [coverMedia, setCoverMedia] = useState<MediaRow | null>(null)
    const [coverDialogOpen, setCoverDialogOpen] = useState(false)

    // Inline image dialog (Tiptap)
    const [inlineDialogOpen, setInlineDialogOpen] = useState(false)
    const [editorApi, setEditorApi] = useState<{
        insertImage: (src: string, alt?: string) => void
    } | null>(null)

    const [publishMode, setPublishMode] = useState<PublishMode>(
        initial?.scheduledAt ? "scheduled" : initial?.published ? "now" : "draft"
    )
    const [scheduledDate, setScheduledDate] = useState<string>(() => {
        if (!initial?.scheduledAt) return ""
        const d = new Date(initial.scheduledAt * 1000)
        const pad = (n: number) => String(n).padStart(2, "0")
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Hydrate cover media on edit
    useEffect(() => {
        if (!initial?.coverImageId) {
            setCoverMedia(null)
            return
        }
        let mounted = true
            ; (async () => {
                try {
                    const row = await getMediaByIdAction(initial.coverImageId!)
                    if (mounted) setCoverMedia(row as unknown as MediaRow | null)
                } catch {
                    // ignore — no cover
                }
            })()
        return () => {
            mounted = false
        }
    }, [initial?.coverImageId])

    // Auto-slug from title
    useEffect(() => {
        if (mode === "edit" && slugTouched) return
        if (slugTouched) return
        setSlug(slugify(title))
    }, [title, slugTouched, mode])

    // Auto-excerpt from content
    useEffect(() => {
        if (excerptTouched) return
        if (!content) return
        setExcerpt(htmlToExcerpt(content))
    }, [content, excerptTouched])

    const isValid = useMemo(
        () =>
            title.trim().length > 0 &&
            slug.trim().length > 0 &&
            content.trim().length > 0,
        [title, slug, content]
    )

    function buildPayload() {
        let finalScheduledAt: number | null = null
        let finalPublished = published

        if (publishMode === "draft") {
            finalPublished = false
            finalScheduledAt = null
        } else if (publishMode === "now") {
            finalPublished = true
            finalScheduledAt = null
        } else if (publishMode === "scheduled") {
            finalPublished = false
            if (scheduledDate) {
                finalScheduledAt = Math.floor(
                    new Date(scheduledDate).getTime() / 1000
                )
            }
        }

        return {
            title: title.trim(),
            slug: slug.trim(),
            content,
            excerpt: excerpt.trim(),
            categoryId,
            coverImageId: coverMedia?.id ?? null,
            published: finalPublished,
            scheduledAt: finalScheduledAt,
        }
    }

    async function handleSave() {
        setErrors({})

        const { error } = schema.validate(
            { title, slug, content, excerpt },
            { abortEarly: false }
        )
        if (error) {
            const map: Record<string, string> = {}
            error.details.forEach((d) => {
                map[d.path[0] as string] = d.message
            })
            setErrors(map)
            toast.error("Please fix the errors below")
            return
        }

        setLoading(true)
        try {
            const payload = buildPayload()

            if (mode === "create") {
                const id = await createPostAction(payload)
                toast.success(
                    publishMode === "scheduled"
                        ? "Post scheduled"
                        : publishMode === "now"
                            ? "Post published"
                            : "Draft saved"
                )
                onSaved(id)
            } else if (initial?.id) {
                await updatePostAction(initial.id, {
                    title: payload.title,
                    slug: payload.slug,
                    content: payload.content,
                    excerpt: payload.excerpt,
                    categoryId: payload.categoryId,
                    coverImageId: payload.coverImageId,
                    scheduledAt: payload.scheduledAt,
                })

                if (publishMode === "now" && !published) {
                    await publishPostAction(initial.id)
                } else if (publishMode === "draft" && published) {
                    await unpublishPostAction(initial.id)
                }

                toast.success("Post saved")
                onSaved(initial.id)
            }
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                {/* Main column */}
                <div className="flex flex-col gap-3 min-w-0">
                    <FieldGroup className="gap-3">
                        <Field>
                            <FieldLabel htmlFor="post-title" className="sr-only">
                                Title
                            </FieldLabel>
                            <Input
                                id="post-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Post title"
                                className="text-xl font-semibold h-auto py-2.5 border-0 shadow-none px-0 focus-visible:ring-0"
                                disabled={loading}
                            />
                            {errors.title && (
                                <FieldDescription className="text-red-500">
                                    {errors.title}
                                </FieldDescription>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="post-slug" className="sr-only">
                                Slug
                            </FieldLabel>
                            <div className="flex items-center gap-2 text-xs text-brand-muted">
                                <span className="font-mono">/news/</span>
                                <Input
                                    id="post-slug"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlug(e.target.value)
                                        setSlugTouched(true)
                                    }}
                                    placeholder="post-slug"
                                    className="font-mono text-xs h-7"
                                    disabled={loading}
                                />
                            </div>
                            {errors.slug && (
                                <FieldDescription className="text-red-500">
                                    {errors.slug}
                                </FieldDescription>
                            )}
                        </Field>
                    </FieldGroup>

                    <TiptapEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Tell your story..."
                        disabled={loading}
                        onInsertImage={() => setInlineDialogOpen(true)}
                        onReady={setEditorApi}
                    />
                    {errors.content && (
                        <p className="text-xs text-red-500">{errors.content}</p>
                    )}
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-3 min-w-0">
                    {/* Publish */}
                    <div className="rounded-lg border border-line bg-white p-3 flex flex-col gap-2">
                        <h3 className="font-semibold text-sm">Publish</h3>
                        <Select
                            value={publishMode}
                            onValueChange={(v) => setPublishMode(v as PublishMode)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Save as draft</SelectItem>
                                <SelectItem value="now">Publish now</SelectItem>
                                <SelectItem value="scheduled">Schedule</SelectItem>
                            </SelectContent>
                        </Select>

                        {publishMode === "scheduled" && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-brand-muted shrink-0" />
                                <Input
                                    type="datetime-local"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                        )}
                    </div>

                    {/* Cover image */}
                    <div className="rounded-lg border border-line bg-white p-3 flex flex-col gap-2">
                        <h3 className="font-semibold text-sm">Cover image</h3>

                        {coverMedia ? (
                            <div className="flex flex-col gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={coverMedia.thumbnail_url ?? coverMedia.url}
                                    alt={
                                        coverMedia.alt_text ?? coverMedia.file_name
                                    }
                                    className="rounded-md w-full aspect-video object-cover border"
                                />
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => setCoverDialogOpen(true)}
                                        disabled={loading}
                                    >
                                        Replace
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCoverMedia(null)}
                                        disabled={loading}
                                        aria-label="Remove cover"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCoverDialogOpen(true)}
                                disabled={loading}
                                className="w-full h-24 flex flex-col gap-1"
                            >
                                <ImageIcon className="h-5 w-5" />
                                <span className="text-xs">
                                    Choose cover image
                                </span>
                            </Button>
                        )}
                    </div>

                    {/* Category */}
                    <div className="rounded-lg border border-line bg-white p-3 flex flex-col gap-2">
                        <h3 className="font-semibold text-sm">Category</h3>
                        <CategorySelect
                            value={categoryId}
                            onChange={setCategoryId}
                            includeNone
                            noneLabel="Uncategorized"
                        />
                    </div>

                    {/* Tags */}
                    <div className="rounded-lg border border-line bg-white p-3 flex flex-col gap-2">
                        <h3 className="font-semibold text-sm">Tags</h3>
                        <TagSelect value={tags} onChange={setTags} />
                    </div>

                    {/* Excerpt */}
                    <div className="rounded-lg border border-line bg-white p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Excerpt</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                    setExcerpt(htmlToExcerpt(content))
                                    setExcerptTouched(false)
                                }}
                                disabled={!content}
                                title="Auto-generate from content"
                            >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Auto
                            </Button>
                        </div>
                        <textarea
                            value={excerpt}
                            onChange={(e) => {
                                setExcerpt(e.target.value)
                                setExcerptTouched(true)
                            }}
                            placeholder="Short summary shown in lists and previews"
                            rows={3}
                            disabled={loading}
                            className="w-full px-2.5 py-1.5 border border-input rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors.excerpt && (
                            <p className="text-xs text-red-500">
                                {errors.excerpt}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={loading || !isValid}
                >
                    <Save className="h-4 w-4 mr-1" />
                    {loading
                        ? "Saving..."
                        : mode === "create"
                            ? "Save Post"
                            : "Save Changes"}
                </Button>
            </div>

            {/* Cover picker */}
            <MediaDialog
                open={coverDialogOpen}
                onOpenChange={setCoverDialogOpen}
                accept="image"
                onSelect={(media) => setCoverMedia(media)}
            />

            {/* Inline image picker for Tiptap */}
            <MediaDialog
                open={inlineDialogOpen}
                onOpenChange={setInlineDialogOpen}
                accept="image"
                onSelect={(media) => {
                    editorApi?.insertImage(
                        media.url,
                        media.alt_text ?? media.file_name
                    )
                }}
            />
        </div>
    )
}