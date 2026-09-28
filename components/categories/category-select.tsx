"use client"

import { useEffect, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getCategoriesAction } from "@/actions/category.actions"
import type { Category } from "@/components/categories/category-tree"

const NONE = "__none__"

type CategorySelectProps = {
    value?: string | null
    onChange: (value: string | null) => void
    placeholder?: string
    disabled?: boolean
    includeNone?: boolean
    noneLabel?: string
}

export function CategorySelect({
    value,
    onChange,
    placeholder = "Select a category",
    disabled,
    includeNone = true,
    noneLabel = "Uncategorized",
}: CategorySelectProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const data = await getCategoriesAction()
                    if (mounted) setCategories(data as Category[])
                } finally {
                    if (mounted) setLoading(false)
                }
            })()
        return () => {
            mounted = false
        }
    }, [])

    const flat = flatten(categories)

    return (
        <Select
            value={value ?? NONE}
            onValueChange={(v) => onChange(v === NONE ? null : v)}
            disabled={disabled || loading}
        >
            <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading..." : placeholder} />
            </SelectTrigger>
            <SelectContent>
                {includeNone && <SelectItem value={NONE}>{noneLabel}</SelectItem>}
                {flat.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                        {c.depth > 0 ? `${"— ".repeat(c.depth)}${c.name}` : c.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

type FlatCategory = Category & { depth: number }

function flatten(categories: Category[]): FlatCategory[] {
    const result: FlatCategory[] = []
    const walk = (cats: Category[], depth: number) => {
        for (const cat of cats) {
            result.push({ ...cat, depth })
            if (cat.children?.length) walk(cat.children, depth + 1)
        }
    }
    walk(categories, 0)
    return result
}