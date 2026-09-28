import { cn } from "@/lib/utils"

type PostArticleProps = {
    /** Tiptap-generated HTML */
    html: string
    className?: string
}

export function PostArticle({ html, className }: PostArticleProps) {
    return (
        <div
            className={cn(
                "prose prose-neutral dark:prose-invert max-w-none",
                // Headings
                "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:text-[#242527] dark:prose-headings:text-[#f6f6f6]",
                "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
                // Body text
                "prose-p:leading-relaxed prose-p:text-[14px] prose-p:text-[#242527] dark:prose-p:text-[#d4d4d4]",
                // Links
                "prose-a:text-blue-dark prose-a:underline prose-a:underline-offset-4 prose-a:decoration-blue-dark/40 hover:prose-a:decoration-blue-dark",
                // Code
                "prose-code:bg-[#f6f6f6] prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-[#242527]",
                "dark:prose-code:bg-[#2a2a2a] dark:prose-code:text-[#f6f6f6]",
                "prose-code:before:content-none prose-code:after:content-none",
                "prose-pre:bg-[#f6f6f6] prose-pre:border prose-pre:border-line prose-pre:rounded-lg prose-pre:overflow-x-auto",
                "dark:prose-pre:bg-[#242527] dark:prose-pre:border-[#333]",
                // Images
                "prose-img:rounded-lg prose-img:border prose-img:border-line dark:prose-img:border-[#333]",
                // Blockquotes
                "prose-blockquote:border-l-4 prose-blockquote:border-blue/40 prose-blockquote:not-italic prose-blockquote:text-[#a1a1a1] dark:prose-blockquote:text-[#9ca3af]",
                // Tables
                "prose-table:border prose-th:border prose-td:border dark:prose-table:border-[#333] dark:prose-th:border-[#333] dark:prose-td:border-[#333]",
                className
            )}
            // Content is authored HTML from Tiptap, sanitized on the server before storage
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}