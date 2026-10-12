"use client"

import { useState } from "react"
import { Link2, Check, Share2 } from "lucide-react"
import { FaLinkedin, FaXTwitter } from 'react-icons/fa6';
 
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type PostShareProps = {
    url: string
    title: string
    className?: string
}

export function PostShare({ url, title, className }: PostShareProps) {
    const [copied, setCopied] = useState(false)

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast.success("Link copied")
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error("Could not copy link")
        }
    }

    async function nativeShare() {
        if (!navigator.share) return copyLink()
        try {
            await navigator.share({ title, url })
        } catch {
            // user cancelled — ignore
        }
    }

    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-0 border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-[#a1a1a1] hover:border-blue-dark hover:text-blue-dark transition-colors dark:bg-[#242527] dark:border-[#333] dark:text-[#6b7280]"
                aria-label="Copy link"
            >
                {copied ? (
                    <Check className="h-3.5 w-3.5" />
                ) : (
                    <Link2 className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                    {copied ? "Copied" : "Copy link"}
                </span>
            </button>

            <a
                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 w-8 rounded-0 border border-line text-[#a1a1a1] hover:border-blue-dark hover:text-blue-dark transition-colors dark:border-[#333] dark:text-[#6b7280]"
                aria-label="Share on X"
            >
                <FaXTwitter className="h-3.5 w-3.5" />
            </a>

            <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 w-8 rounded-0 border border-line text-[#a1a1a1] hover:border-blue-dark hover:text-blue-dark transition-colors dark:border-[#333] dark:text-[#6b7280]"
                aria-label="Share on LinkedIn"
            >
                <FaLinkedin className="h-3.5 w-3.5" />
            </a>

            {/* Native share — hidden on desktop unless supported */}
            <button
                type="button"
                onClick={nativeShare}
                className="sm:hidden inline-flex items-center justify-center h-8 w-8 rounded-0 border border-line text-[#a1a1a1] hover:border-blue-dark hover:text-blue-dark transition-colors dark:border-[#333] dark:text-[#6b7280]"
                aria-label="Share"
            >
                <Share2 className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}