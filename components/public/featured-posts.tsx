import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { listPublishedPostsAction } from "@/actions/post.actions"
import {
    PublicPostCard,
    type PublicPostCardData,
} from "@/components/public/posts/public-post-card"

export async function FeaturedPosts() {
    const posts = (await listPublishedPostsAction({
        limit: 3,
        offset: 0,
    })) as unknown as PublicPostCardData[]

    if (posts.length === 0) return null

    return (
        <section
            id="posts"
            className="scroll-mt-16 container-x py-16 sm:py-20"
        >
            <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
                <header className="flex flex-col gap-3 max-w-2xl">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Notes
                    </span>
                    <h2 className="section-heading">
                        From the notebook
                    </h2>
                    <p className="section-copy">
                        Essays, tutorials, and the occasional strong opinion.
                    </p>
                </header>

                <Link
                    href="/posts"
                    className="text-link-brand text-blue-dark transition-opacity hover:opacity-70"
                >
                    See all posts
                    <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post, i) => (
                    <PublicPostCard
                        key={post.id}
                        post={post}
                    />
                ))}
            </div>
        </section>
    )
}