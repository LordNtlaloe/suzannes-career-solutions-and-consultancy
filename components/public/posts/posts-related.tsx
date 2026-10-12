import Link from "next/link"
import { Calendar, Eye, Heart, MessageSquare } from "lucide-react"

type RelatedPost = {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    published_at?: number | null
    view_count?: number
    like_count?: number
    comment_count?: number
    cover_image_url?: string | null
    cover_image_alt?: string | null
    cover_image_thumb?: string | null
}

type PostRelatedProps = {
    posts: RelatedPost[]
}

function formatDate(ts?: number | null) {
    if (!ts) return ""
    return new Date(ts * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

export function PostRelated({ posts }: PostRelatedProps) {
    if (posts.length === 0) return null

    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-[18px] font-semibold">Related posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => {
                    const coverSrc = post.cover_image_thumb ?? post.cover_image_url
                    return (
                        <Link
                            key={post.id}
                            href={`/news/${post.slug}`}
                            className="group flex flex-col rounded-lg border border-line bg-white overflow-hidden hover:border-[#c4c4c4] hover:shadow-soft transition-all dark:bg-[#242527] dark:border-[#333] dark:hover:border-[#555]"
                        >
                            {coverSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={coverSrc}
                                    alt={post.cover_image_alt ?? post.title}
                                    className="w-full aspect-video object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full aspect-video bg-linear-to-br from-light to-[#ededed] dark:from-[#2a2a2a] dark:to-[#333]" />
                            )}

                            <div className="flex flex-col gap-2 p-4">
                                <h3 className="font-semibold text-[16px] leading-snug line-clamp-2 group-hover:text-blue-dark transition-colors">
                                    {post.title}
                                </h3>
                                {post.excerpt && (
                                    <p className="section-copy line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                )}
                                <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-[#a1a1a1] dark:text-[#6b7280]">
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(post.published_at)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {post.view_count ?? 0}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Heart className="h-3 w-3" />
                                            {post.like_count ?? 0}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            {post.comment_count ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}