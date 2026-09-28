import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, FileEdit, Trash2 } from "lucide-react"

type Status = "draft" | "published" | "scheduled" | "deleted"

type Props = {
    status: Status
    className?: string
}

const config: Record<Status, { label: string; icon: React.ElementType; className: string }> = {
    draft: {
        label: "Draft",
        icon: FileEdit,
        className: "bg-light text-brand-muted",
    },
    published: {
        label: "Published",
        icon: CheckCircle2,
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    scheduled: {
        label: "Scheduled",
        icon: Clock,
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    deleted: {
        label: "Deleted",
        icon: Trash2,
        className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    },
}

export function PostStatusBadge({ status, className }: Props) {
    const { label, icon: Icon, className: cls } = config[status]
    return (
        <Badge variant="outline" className={cn("gap-1 font-medium", cls, className)}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    )
}

export function getPostStatus(post: {
    is_deleted?: boolean | number
    published?: boolean | number
    scheduled_at?: number | null
}): Status {
    if (post.is_deleted) return "deleted"
    if (post.published) return "published"
    if (post.scheduled_at) return "scheduled"
    return "draft"
}