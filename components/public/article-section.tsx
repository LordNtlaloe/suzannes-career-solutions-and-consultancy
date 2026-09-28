import Link from "next/link";
import { ArrowRight, Calendar, Eye } from "lucide-react";

import { listPublishedPostsAction } from "@/actions/post.actions";
import type { PublicPostCardData } from "@/components/public/posts/public-post-card";
import { ReadMore } from "@/components/public/read-more";
import { SectionHeadingRow } from "@/components/public/section-heading-row";

export async function ArticlesSection() {
    const posts = (await listPublishedPostsAction({
        limit: 3,
        offset: 0,
    })) as unknown as PublicPostCardData[];

    if (posts.length === 0) return null;

    return (
        <section id="articles" className="py-22.5 pb-20">
            <div className="container-x">
                <SectionHeadingRow
                    heading={<>News &amp; Update</>}
                    action={
                        <Link
                            href="/posts"
                            className="text-link-brand transition-opacity hover:opacity-70"
                        >
                            View all articles
                            <ArrowRight size={16} />
                        </Link>
                    }
                />

                <div className="mt-11.25 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {posts.map((post) => (
                        <article key={post.id}>
                            {post.cover_image_thumb || post.cover_image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={
                                        post.cover_image_thumb ??
                                        post.cover_image_url ??
                                        ""
                                    }
                                    alt={post.cover_image_alt ?? post.title}
                                    className="h-58.75 w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="h-58.75 w-full bg-linear-to-br from-light to-[#ededed] dark:from-[#2a2a2a] dark:to-[#333]" />
                            )}

                            <div className="mt-4.5 flex items-start gap-4.5">
                                <div className="flex w-8 flex-none flex-col">
                                    <strong className="text-[22px] leading-none">
                                        {formatDay(post.published_at)}
                                    </strong>
                                    <span className="mt-1 text-[9px]">
                                        {formatMonth(post.published_at)}
                                    </span>
                                </div>

                                <h3 className="text-[16px] font-semibold leading-[1.45]">
                                    {post.title}
                                </h3>
                            </div>

                            <p className="section-copy mt-3 ml-12.5">
                                {post.excerpt ?? ""}{" "}
                                <ReadMore href={`/posts/${post.slug}`} />
                            </p>

                            {hasMeta(post) && (
                                <div className="ml-12.5 mt-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] text-[#a1a1a1] dark:text-[#6b7280]">
                                    {post.author_name && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="grid h-4.5 w-4.5 flex-none place-items-center overflow-hidden rounded-full bg-light text-[8px] font-semibold dark:bg-[#2a2a2a]">
                                                {post.author_image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={post.author_image}
                                                        alt={post.author_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    initials(post.author_name)
                                                )}
                                            </span>
                                            <span className="truncate">
                                                {post.author_name}
                                            </span>
                                        </span>
                                    )}

                                    {post.published_at && (
                                        <span className="inline-flex items-center gap-1.25">
                                            <Calendar className="h-2.5 w-2.5" />
                                            {formatDate(post.published_at)}
                                        </span>
                                    )}

                                    {typeof post.view_count === "number" && (
                                        <span className="inline-flex items-center gap-1.25">
                                            <Eye className="h-2.5 w-2.5" />
                                            {post.view_count}
                                        </span>
                                    )}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function hasMeta(post: PublicPostCardData) {
    return Boolean(
        post.author_name ||
        post.published_at ||
        typeof post.view_count === "number"
    );
}

function formatDay(ts?: number | null) {
    if (!ts) return "";
    return String(new Date(ts * 1000).getDate()).padStart(2, "0");
}

function formatMonth(ts?: number | null) {
    if (!ts) return "";
    return new Date(ts * 1000)
        .toLocaleDateString(undefined, { month: "short" })
        .toUpperCase();
}

function formatDate(ts?: number | null) {
    if (!ts) return "";
    return new Date(ts * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function initials(name?: string | null) {
    if (!name) return "?";
    return name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}