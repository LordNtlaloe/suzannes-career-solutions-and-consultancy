import type { FilterOperator, FilterQuery, FilterRule } from "./filters-types"

let counter = 0
const nextId = () => `rule-${Date.now().toString(36)}-${(counter++).toString(36)}`

export function createFilterRule({
    id,
    path,
    operator,
    value,
}: {
    id?: string
    path: string[]
    operator?: FilterOperator
    value: string | string[]
}): FilterRule {
    return {
        id: id ?? nextId(),
        path,
        operator: operator ?? "is",
        value,
    }
}

export function createFilterQuery(rules: FilterRule[] = []): FilterQuery {
    return { rules }
}

/** Insert or replace a rule for the same field path (one rule per field). */
export function upsertRule(query: FilterQuery, rule: FilterRule): FilterQuery {
    const key = rule.path.join(".")
    return {
        rules: [
            ...query.rules.filter((r) => r.path.join(".") !== key),
            rule,
        ],
    }
}

export function removeRule(query: FilterQuery, id: string): FilterQuery {
    return { rules: query.rules.filter((r) => r.id !== id) }
}

export function clearRules(): FilterQuery {
    return { rules: [] }
}
