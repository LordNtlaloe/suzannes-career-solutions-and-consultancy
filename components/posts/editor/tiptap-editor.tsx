"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import CharacterCount from "@tiptap/extension-character-count"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { EditorToolbar } from "./editor-toolbar"

const lowlight = createLowlight(common)

export type EditorApi = {
    insertImage: (src: string, alt?: string) => void
}

type TiptapEditorProps = {
    value: string
    onChange: (html: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    onInsertImage?: () => void
    onReady?: (api: EditorApi) => void
}

export function TiptapEditor({
    value,
    onChange,
    placeholder = "Write something...",
    disabled,
    className,
    onInsertImage,
    onReady,
}: TiptapEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
            }),
            Image.configure({ inline: false, allowBase64: false }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Placeholder.configure({ placeholder }),
            CharacterCount,
            CodeBlockLowlight.configure({ lowlight }),
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
                    "min-h-[360px] px-4 py-3",
                    "prose-headings:scroll-mt-20 prose-pre:bg-light"
                ),
            },
        },
    })

    // Keep external value in sync when it changes
    useEffect(() => {
        if (!editor) return
        const current = editor.getHTML()
        if (value !== current) {
            editor.commands.setContent(value || "", { emitUpdate: false })
        }
    }, [value, editor])

    useEffect(() => {
        if (!editor) return
        editor.setEditable(!disabled)
    }, [disabled, editor])

    // Expose insert API to the parent
    useEffect(() => {
        if (!editor || !onReady) return
        onReady({
            insertImage: (src, alt) => {
                editor.chain().focus().setImage({ src, alt }).run()
            },
        })
    }, [editor, onReady])

    if (!editor) {
        return (
            <div className="rounded-md border bg-light min-h-100 animate-pulse" />
        )
    }

    return (
        <div className={cn("rounded-md border border-line bg-white", className)}>
            <EditorToolbar editor={editor} onInsertImage={onInsertImage} />
            <EditorContent editor={editor} />
            <div className="flex items-center justify-between border-t border-line px-3 py-1.5 text-xs text-brand-muted">
                <span>{editor.storage.characterCount.words()} words</span>
                <span>{editor.storage.characterCount.characters()} characters</span>
            </div>
        </div>
    )
}