"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"

type Props = {
    placeholder?: string
    /** Debounce in ms before pushing to URL */
    debounce?: number
}

export function PublicSearch({ placeholder = "Search posts...", debounce = 300 }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [value, setValue] = useState(searchParams.get("q") ?? "")

    // Sync when URL changes externally
    useEffect(() => {
        setValue(searchParams.get("q") ?? "")
    }, [searchParams])

    // Debounced URL update
    useEffect(() => {
        const current = searchParams.get("q") ?? ""
        if (value === current) return

        const id = window.setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set("q", value)
                params.delete("page") // reset pagination on new search
            } else {
                params.delete("q")
            }
            router.replace(`${pathname}?${params.toString()}`)
        }, debounce)

        return () => window.clearTimeout(id)
    }, [value, debounce, pathname, router, searchParams])

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1a1] pointer-events-none dark:text-[#6b7280]" />
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full h-10 rounded-0 border border-line bg-white pl-9 pr-9 text-[13px] text-ink placeholder:text-[#a1a1a1] outline-none focus:border-blue-dark focus:ring-1 focus:ring-blue-dark transition-colors dark:bg-[#242527] dark:border-[#333] dark:text-[#f6f6f6] dark:placeholder:text-[#6b7280]"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => setValue("")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded text-[#a1a1a1] hover:text-ink hover:bg-light transition-colors dark:text-[#6b7280] dark:hover:text-[#f6f6f6] dark:hover:bg-[#2a2a2a]"
                    aria-label="Clear search"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    )
}