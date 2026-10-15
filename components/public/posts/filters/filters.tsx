"use client"

import { useMemo, useState } from "react"
import { ChevronRight, Search, SlidersHorizontal, X } from "lucide-react"
import type { FilterField, FilterQuery, FilterRule } from "./filters-types"
import { clearRules, removeRule, upsertRule } from "./filters-query"

type Props = {
    fields: FilterField[]
    query: FilterQuery
    onQueryChange: (query: FilterQuery) => void
    showClear?: boolean
}

function findField(fields: FilterField[], id: string): FilterField | undefined {
    for (const field of fields) {
        if (field.id === id) return field
        if (field.fields) {
            const found = findField(field.fields, id)
            if (found) return found
        }
    }
    return undefined
}

function ruleField(fields: FilterField[], rule: FilterRule) {
    return findField(fields, rule.path[rule.path.length - 1])
}

export function Filters({ fields, query, onQueryChange, showClear }: Props) {
    const [open, setOpen] = useState(false)
    const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
    const [search, setSearch] = useState("")

    const activeField = activeFieldId ? findField(fields, activeFieldId) : null

    const visibleFields = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return fields
        return fields.filter(
            (field) =>
                field.label.toLowerCase().includes(q) ||
                (field.keywords ?? []).some((keyword) =>
                    keyword.toLowerCase().includes(q)
                )
        )
    }, [fields, search])

    const close = () => {
        setOpen(false)
        setActiveFieldId(null)
        setSearch("")
    }

    const commitSelect = (field: FilterField, optionValue: string) => {
        onQueryChange(
            upsertRule(query, {
                id: `${field.id}-rule`,
                path: [field.id],
                operator: "is",
                value: optionValue,
            })
        )
        close()
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Active rules as chips */}
            {query.rules.map((rule) => {
                const field = ruleField(fields, rule)
                const value =
                    typeof rule.value === "string"
                        ? (field?.options?.find((o) => o.value === rule.value)?.label ??
                          rule.value)
                        : rule.value.join(", ")

                return (
                    <span
                        key={rule.id}
                        className="inline-flex items-center gap-1.5 rounded-0 border border-blue-dark/20 bg-blue-dark/10 px-2.5 py-1.5 text-[12px] font-semibold text-blue-dark dark:border-blue-light/30 dark:bg-blue-light/10 dark:text-blue-light"
                    >
                        <span className="opacity-70">
                            {field?.label ?? rule.path.join(" / ")}:
                        </span>
                        <span>{value}</span>
                        <button
                            type="button"
                            onClick={() => onQueryChange(removeRule(query, rule.id))}
                            aria-label={`Remove ${field?.label ?? "filter"}`}
                            className="ml-1 inline-flex h-4 w-4 items-center justify-center text-blue-dark/70 transition-colors hover:text-blue-dark dark:text-blue-light/70 dark:hover:text-blue-light"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                )
            })}

            {showClear && query.rules.length > 0 && (
                <button
                    type="button"
                    onClick={() => onQueryChange(clearRules())}
                    className="text-[12px] font-semibold text-[#a1a1a1] transition-colors hover:text-blue-dark hover:underline dark:text-[#6b7280]"
                >
                    Clear all
                </button>
            )}

            {/* Field picker */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => {
                        setOpen((value) => !value)
                        setActiveFieldId(null)
                        setSearch("")
                    }}
                    aria-expanded={open}
                    className="inline-flex items-center gap-1.5 rounded-0 border border-line bg-white px-3 py-2 text-[12px] font-semibold text-ink transition-colors hover:border-blue-dark hover:text-blue-dark dark:border-[#333] dark:bg-[#242527] dark:text-white dark:hover:border-blue-light"
                >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filter
                </button>

                {open && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={close}
                            aria-hidden
                        />
                        <div className="absolute left-0 top-full z-50 mt-2 w-72 border border-line bg-white shadow-soft dark:border-[#333] dark:bg-[#242527]">
                            <div className="flex items-center gap-2 border-b border-line px-3 py-2 dark:border-[#333]">
                                <Search className="h-4 w-4 shrink-0 text-[#a1a1a1]" />
                                <input
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value)
                                        setActiveFieldId(null)
                                    }}
                                    placeholder="Search fields"
                                    className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-[#a1a1a1] dark:text-white dark:placeholder:text-[#6b7280]"
                                />
                            </div>

                            {activeField ? (
                                <div className="max-h-72 overflow-auto p-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveFieldId(null)}
                                        className="flex w-full items-center gap-2 rounded-0 px-3 py-2 text-left text-[12px] font-semibold text-[#a1a1a1] transition-colors hover:bg-light dark:hover:bg-[#333]"
                                    >
                                        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                                        {activeField.label}
                                    </button>
                                    {activeField.options?.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                commitSelect(activeField, option.value)
                                            }
                                            className="flex w-full items-center justify-between gap-2 rounded-0 px-3 py-2 text-left text-[13px] text-ink transition-colors hover:bg-light dark:text-white dark:hover:bg-[#333]"
                                        >
                                            <span>{option.label}</span>
                                            {typeof option.count === "number" && (
                                                <span className="tabular-nums text-[11px] text-[#a1a1a1]">
                                                    {option.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="max-h-72 overflow-auto p-1">
                                    {visibleFields.map((field) => (
                                        <button
                                            key={field.id}
                                            type="button"
                                            onClick={() => setActiveFieldId(field.id)}
                                            className="flex w-full items-center justify-between gap-2 rounded-0 px-3 py-2 text-left text-[13px] text-ink transition-colors hover:bg-light dark:text-white dark:hover:bg-[#333]"
                                        >
                                            <span className="flex items-center gap-2">
                                                {field.icon && (
                                                    <span className="text-[#a1a1a1]">
                                                        {field.icon}
                                                    </span>
                                                )}
                                                {field.label}
                                            </span>
                                            <ChevronRight className="h-3.5 w-3.5 text-[#a1a1a1]" />
                                        </button>
                                    ))}
                                    {visibleFields.length === 0 && (
                                        <p className="px-3 py-4 text-center text-[12px] text-[#a1a1a1]">
                                            No fields match.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
