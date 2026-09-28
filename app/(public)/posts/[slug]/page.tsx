import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

import {
    getPostWithRelationsBySlugAction,
    getRelatedPostsAction,
} from "@/actions/post.actions"
import { countPostCommentsAction } from "@/actions/comment.actions"
import {
    hasLikedPostAction,
    hasBookmarkedAction,
} from "@/actions/like.actions"
import { canViewPost } from "@/lib/posts/permissions"
import { getReadingMinutes } from "@/lib/posts/read-time"

import { PostArticle } from "@/components/public/posts/post-article"
import { PostHeader } from "@/components/public/posts/post-header"
import { PostShare } from "@/components/public/posts/post-share"
import { ViewTracker } from "@/components/public/posts/view-tracker"
import { CommentSection } from "@/components/comments/comment-section"
import { LikeButton } from "@/components/posts/like-button"
import { BookmarkButton } from "@/components/posts/bookmark-button"
import { PostRelated } from "@/components/public/posts/posts-related"

type PageProps = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await getPostWithRelationsBySlugAction(slug)
    if (!post || post.is_deleted || !post.published) {
        return { title: "Post not found" }
    }

    const ogImage = (post as any).cover_image_url ?? undefined

    return {
        title: post.title,
        description: post.excerpt ?? undefined,
        openGraph: {
            title: post.title,
            description: post.excerpt ?? undefined,
            type: "article",
            publishedTime: post.published_at
                ? new Date(post.published_at * 1000).toISOString()
                : undefined,
            modifiedTime: new Date(post.updated_at * 1000).toISOString(),
            authors: post.author_name ? [post.author_name] : undefined,
            tags: post.tags?.map((t) => t.name),
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
        twitter: {
            card: ogImage ? "summary_large_image" : "summary",
            title: post.title,
            description: post.excerpt ?? undefined,
            images: ogImage ? [ogImage] : undefined,
        },
    }
}

export default async function PublicPostPage({ params }: PageProps) {
    const { slug } = await params

    const post = await getPostWithRelationsBySlugAction(slug)
    if (!post) notFound()

    const session = await auth.api.getSession({ headers: await headers() })
    const { ok } = await canViewPost(post.id, session?.user ?? null)
    if (!ok) notFound()

    const [related, commentCount, liked, bookmarked] = await Promise.all([
        post.category_id
            ? getRelatedPostsAction(post.id, 3)
            : Promise.resolve([]),
        countPostCommentsAction(post.id),
        session?.user ? hasLikedPostAction(post.id) : Promise.resolve(false),
        session?.user ? hasBookmarkedAction(post.id) : Promise.resolve(false),
    ])

    const readingMinutes = getReadingMinutes(post.content)

    const headersList = await headers()
    const host = headersList.get("host") ?? "localhost:3000"
    const protocol = host.startsWith("localhost") ? "http" : "https"
    const url = `${protocol}://${host}/posts/${post.slug}`

    const coverUrl = (post as any).cover_image_url as string | null
    const coverAlt = (post as any).cover_image_alt as string | null

    return (
        <article className="container-x w-[min(900px,calc(100%-48px))]! py-8 sm:py-12">
            {/* Back link */}
            <Link
                href="/posts"
                className="text-link-brand mb-6 inline-flex items-center gap-1.5 text-[#a1a1a1] transition-colors hover:text-blue-dark"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                All posts
            </Link>

            {/* Status banners — brand-tinted */}
            {!post.published && (
                <div className="mb-6 rounded-md border border-[#f0c36d]/40 bg-[#fef6e7] px-3 py-2 text-[13px] text-[#8a5a00]">
                    {post.scheduled_at
                        ? `Scheduled for ${new Date(post.scheduled_at * 1000).toLocaleString()}`
                        : "Draft — this post is not visible to the public"}
                </div>
            )}
            {post.is_deleted && (
                <div className="mb-6 rounded-md border border-[#e88]/40 bg-[#fdecec] px-3 py-2 text-[13px] text-[#8a1a1a]">
                    This post is in the trash.
                </div>
            )}

            <PostHeader
                title={post.title}
                authorName={post.author_name}
                authorImage={post.author_image}
                publishedAt={post.published_at}
                updatedAt={post.updated_at}
                categoryId={post.category_id}
                categoryName={post.category_name}
                categorySlug={post.category_slug}
                tags={post.tags ?? []}
                readingMinutes={readingMinutes}
            />

            {coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={coverUrl}
                    alt={coverAlt ?? post.title}
                    className="mt-8 w-full aspect-video object-cover border border-line bg-white p-1.75"
                    loading="eager"
                />
            )}

            <hr className="my-8 border-line" />

            <PostArticle html={post.content} />

            <hr className="my-8 border-line" />

            {/* Actions row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <PostShare url={url} title={post.title} />
                    <LikeButton
                        postId={post.id}
                        initialCount={post.like_count}
                        initialLiked={liked}
                        isAuthenticated={!!session?.user}
                    />
                    <BookmarkButton
                        postId={post.id}
                        initialCount={post.bookmark_count}
                        initialBookmarked={bookmarked}
                        isAuthenticated={!!session?.user}
                    />
                </div>
                {(session?.user?.id === post.user_id ||
                    session?.user?.role === "admin") && (
                        <Link
                            href={`/dashboard/posts?edit=${post.id}`}
                            className="text-[12px] text-[#a1a1a1] transition-colors hover:text-blue-dark hover:underline"
                        >
                            Edit post
                        </Link>
                    )}
            </div>

            {/* Comments */}
            <div className="mt-12">
                <CommentSection
                    postId={post.id}
                    initialCount={commentCount}
                    currentUserId={session?.user?.id ?? null}
                    currentUserRole={(session?.user as any)?.role ?? null}
                    isAuthenticated={!!session?.user}
                />
            </div>

            {/* Related */}
            {related.length > 0 && (
                <div className="mt-12">
                    <PostRelated posts={related as any} />
                </div>
            )}

            <ViewTracker postId={post.id} />
        </article>
    )
}