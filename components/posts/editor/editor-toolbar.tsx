"use client"

import type { Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type EditorToolbarProps = {
    editor: Editor | null
    onInsertImage?: () => void
}

function ToolbarButton({
    onClick,
    active,
    disabled,
    label,
    children,
}: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    label: string
    children: React.ReactNode
}) {
    return (
        <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={cn(
                "h-8 w-8 p-0",
                active && "bg-blue-dark text-white"
            )}
        >
            {children}
        </Button>
    )
}

function Divider() {
    return <div className="mx-1 h-6 w-px bg-border" />
}

export function EditorToolbar({ editor, onInsertImage }: EditorToolbarProps) {
    if (!editor) return null

    function setLink() {
        const prev = editor!.getAttributes("link").href ?? ""
        const url = window.prompt("URL", prev)
        if (url === null) return
        if (url === "") {
            editor!.chain().focus().extendMarkRange("link").unsetLink().run()
            return
        }
        editor!
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run()
    }

    return (
        <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 bg-light/30 p-1">
            <ToolbarButton
                label="Undo"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
            >
                <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Redo"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
            >
                <Redo className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                label="Heading 1"
                active={editor.isActive("heading", { level: 1 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Heading 2"
                active={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Heading 3"
                active={editor.isActive("heading", { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
                <Heading3 className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                label="Bold"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Italic"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Underline"
                active={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Strikethrough"
                active={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Inline code"
                active={editor.isActive("code")}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <Code className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                label="Bullet list"
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Ordered list"
                active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Blockquote"
                active={editor.isActive("blockquote")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
                <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Horizontal rule"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <Minus className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                label="Align left"
                active={editor.isActive({ textAlign: "left" })}
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
                <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Align center"
                active={editor.isActive({ textAlign: "center" })}
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
                <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                label="Align right"
                active={editor.isActive({ textAlign: "right" })}
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
                <AlignRight className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                label="Link"
                active={editor.isActive("link")}
                onClick={setLink}
            >
                <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            {onInsertImage && (
                <ToolbarButton label="Insert image" onClick={onInsertImage}>
                    <ImageIcon className="h-4 w-4" />
                </ToolbarButton>
            )}
        </div>
    )
}