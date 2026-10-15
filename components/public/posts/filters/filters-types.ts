import type { ReactNode } from "react"

export type FilterValueType =
    | "text"
    | "number"
    | "select"
    | "multiselect"
    | "boolean"

export type FilterOption = {
    value: string
    label: string
    count?: number
}

export type FilterField = {
    id: string
    label: string
    type: FilterValueType
    icon?: ReactNode
    options?: FilterOption[]
    fields?: FilterField[]
    keywords?: string[]
    placeholder?: string
    count?: number
}

export type FilterOperator = "is" | "is_not" | "contains"

export type FilterRule = {
    id: string
    path: string[]
    operator: FilterOperator
    value: string | string[]
}

export type FilterQuery = {
    rules: FilterRule[]
}
