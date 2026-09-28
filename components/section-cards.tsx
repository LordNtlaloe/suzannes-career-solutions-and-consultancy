"use client"

import {
    TrendingUp,
    TrendingDown,
    Minus,
    type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type TrendDirection = "up" | "down" | "neutral"

export type SectionCard = {
    /** Label shown above the value */
    label: string
    /** Main value displayed */
    value: string | number
    /** Optional badge text, e.g. "+12.5%" */
    badge?: string
    /** Trend direction — controls badge icon */
    trend?: TrendDirection
    /** Optional icon shown in the footer headline */
    icon?: LucideIcon
    /** Headline text in the footer (first row) */
    footerTitle?: string
    /** Subtext in the footer (second row) */
    footerDescription?: string
}

type SectionCardsProps = {
    cards: SectionCard[]
    className?: string
    /**
     * Max number of columns on large screens.
     * If omitted, uses a sensible default based on `cards.length`
     * (capped at 4). Grid always collapses responsively.
     */
    maxColumns?: 1 | 2 | 3 | 4
}

const trendIconMap: Record<TrendDirection, LucideIcon> = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
}

/**
 * Static class map — Tailwind only picks up classes it can see at build time,
 * so we map counts/column-numbers to real class strings.
 * Each entry: mobile (1 col) → sm (2 cols) → lg (n cols)
 */
const gridColsByCount: Record<number, string> = {
    1: "grid-cols-1 lg:grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6",
}

function resolveGridClass(count: number, maxColumns?: number): string {
    const effective = maxColumns ?? Math.min(count, 4)
    return gridColsByCount[effective] ?? gridColsByCount[4]
}

export function SectionCards({
    cards,
    className,
    maxColumns,
}: SectionCardsProps) {
    const gridClass = resolveGridClass(cards.length, maxColumns)

    return (
        <div
            className={cn(
                "grid gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-blue/5 *:data-[slot=card]:to-white *:data-[slot=card]:shadow-soft dark:*:data-[slot=card]:to-[#242527]",
                gridClass,
                className
            )}
        >
            {cards.map((card, i) => (
                <SectionCardItem key={`${card.label}-${i}`} {...card} />
            ))}
        </div>
    )
}

function SectionCardItem({
    label,
    value,
    badge,
    trend = "neutral",
    icon,
    footerTitle,
    footerDescription,
}: SectionCard) {
    const TrendIcon = trendIconMap[trend]
    const FooterIcon = icon ?? TrendIcon

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {value}
                </CardTitle>
                {badge && (
                    <CardAction>
                        <Badge variant="outline">
                            <TrendIcon />
                            {badge}
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>
            {(footerTitle || footerDescription) && (
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {footerTitle && (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {footerTitle} <FooterIcon className="size-4" />
                        </div>
                    )}
                    {footerDescription && (
                        <div className="text-brand-muted">
                            {footerDescription}
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}