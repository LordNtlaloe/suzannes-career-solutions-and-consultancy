"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    getPostById,
    getPostBySlug,
    getPostWithRelations,
    getPostWithRelationsBySlug,
    listPosts,
    countPosts,
    getDashboardPostStats,
    getPopularPosts,
    getRecentPosts,
    searchPosts,
    getRelatedPosts,
    createPost,
    updatePost,
    publishPost,
    unpublishPost,
    softDeletePost,
    restorePost,
    hardDeletePost,
    recordView,
    type PostListFilters,
    countPublishedPosts,
    listPublishedPosts,
    PublicPostFilters,
} from "@/db/queries/posts";
import Joi from "joi";

// ---------- Validation ----------

const createPostSchema = Joi.object({
    title: Joi.string().required().min(1).max(255),
    slug: Joi.string().required().min(1).max(255),
    content: Joi.string().required().min(1),
    excerpt: Joi.string().allow("").max(500).optional(),
    categoryId: Joi.string().allow("", null).optional(),
    coverImageId: Joi.string().allow("", null).optional(),
    published: Joi.boolean().optional(),
    scheduledAt: Joi.number().integer().allow(null).optional(),
});

const updatePostSchema = Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    slug: Joi.string().min(1).max(255).optional(),
    content: Joi.string().min(1).optional(),
    excerpt: Joi.string().allow("").max(500).optional(),
    categoryId: Joi.string().allow("", null).optional(),
    coverImageId: Joi.string().allow("", null).optional(),
    scheduledAt: Joi.number().integer().allow(null).optional(),
}).min(1);

// ---------- Auth ----------

async function getSession() {
    return auth.api.getSession({ headers: await headers() });
}

async function requireAuth() {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");
    return session;
}

async function requireStaff() {
    const session = await getSession();
    if (!session?.user?.role || !["admin", "moderator"].includes(session.user.role)) {
        throw new Error("Unauthorized");
    }
    return session;
}

/**
 * A user can edit their own post; staff can edit any post.
 */
async function requirePostAccess(postId: string) {
    const session = await requireAuth();
    const post = await getPostById(postId);
    if (!post) throw new Error("Post not found");

    const isOwner = post.user_id === session.user.id;
    const isStaff = ["admin", "moderator"].includes(session.user.role as string);

    if (!isOwner && !isStaff) throw new Error("Forbidden");
    return { session, post };
}

// ---------- Serialization helpers ----------

function toPlain<T extends Record<string, any>>(row: T): T {
    const out: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
        if (typeof value === "bigint") out[key] = Number(value);
        else if (value instanceof Date) out[key] = value.toISOString();
        else if (value === undefined) out[key] = null;
        else out[key] = value;
    }
    return out as T;
}

function toPlainArray<T extends Record<string, any>>(rows: T[]): T[] {
    return rows.map(toPlain);
}

// ---------- Reads ----------

export async function getPostByIdAction(id: string) {
    const row = await getPostById(id);
    return row ? toPlain(row) : null;
}

export async function getPostBySlugAction(slug: string) {
    const row = await getPostBySlug(slug);
    return row ? toPlain(row) : null;
}

export async function getPostWithRelationsAction(id: string) {
    const row = await getPostWithRelations(id);
    if (!row) return null;
    return {
        ...toPlain(row),
        tags: row.tags.map(toPlain),
    };
}

export async function getPostWithRelationsBySlugAction(slug: string) {
    const row = await getPostWithRelationsBySlug(slug);
    if (!row) return null;
    return {
        ...toPlain(row),
        tags: row.tags.map(toPlain),
    };
}

export async function listPostsAction(filters: PostListFilters = {}) {
    const rows = await listPosts(filters);
    return toPlainArray(rows as unknown as Record<string, any>[]);
}

export async function countPostsAction(filters: PostListFilters = {}) {
    return countPosts(filters);
}

export async function getDashboardPostStatsAction(userId?: string) {
    const row = await getDashboardPostStats(userId);
    return row ? toPlain(row) : null;
}

export async function getPopularPostsAction(limit = 10) {
    const rows = await getPopularPosts(limit);
    return toPlainArray(rows as Record<string, any>[]);
}

export async function getRecentPostsAction(limit = 10) {
    const rows = await getRecentPosts(limit);
    return toPlainArray(rows as Record<string, any>[]);
}

export async function searchPostsAction(query: string, limit = 20) {
    if (!query.trim()) return [];
    const rows = await searchPosts(query, limit);
    return toPlainArray(rows as Record<string, any>[]);
}

export async function getRelatedPostsAction(postId: string, limit = 5) {
    const rows = await getRelatedPosts(postId, limit);
    return toPlainArray(rows as Record<string, any>[]);
}

// ---------- Writes ----------

export async function createPostAction(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    categoryId?: string | null;
    coverImageId?: string | null;
    published?: boolean;
    scheduledAt?: number | null;
}) {
    const session = await requireAuth();

    const { error, value } = createPostSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    try {
        const id = await createPost({
            userId: session.user.id,
            title: value.title,
            slug: value.slug,
            content: value.content,
            excerpt: value.excerpt || null,
            categoryId: value.categoryId || null,
            coverImageId: value.coverImageId || null,
            published: !!value.published,
            scheduledAt: value.scheduledAt ?? null,
        });
        return id;
    } catch (e: any) {
        const msg = String(e?.message ?? "");
        if (msg.includes("UNIQUE") && msg.includes("slug")) {
            throw new Error("A post with that slug already exists");
        }
        throw e;
    }
}

export async function updatePostAction(
    id: string,
    data: {
        title?: string;
        slug?: string;
        content?: string;
        excerpt?: string | null;
        categoryId?: string | null;
        coverImageId?: string | null;
        scheduledAt?: number | null;
    }
) {
    await requirePostAccess(id);

    const { error, value } = updatePostSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    try {
        return await updatePost(id, value);
    } catch (e: any) {
        const msg = String(e?.message ?? "");
        if (msg.includes("UNIQUE") && msg.includes("slug")) {
            throw new Error("A post with that slug already exists");
        }
        throw e;
    }
}

export async function publishPostAction(id: string) {
    await requirePostAccess(id);
    return publishPost(id);
}

export async function unpublishPostAction(id: string) {
    await requirePostAccess(id);
    return unpublishPost(id);
}

export async function softDeletePostAction(id: string) {
    await requirePostAccess(id);
    return softDeletePost(id);
}

export async function restorePostAction(id: string) {
    // Restoring requires staff — the post may not be visible to its owner anymore
    await requireStaff();
    return restorePost(id);
}

export async function hardDeletePostAction(id: string) {
    // Permanent deletion is admin-only
    const session = await requireAuth();
    if (session.user.role !== "admin") throw new Error("Unauthorized");
    await hardDeletePost(id);
}

// ---------- Views ----------

export async function recordViewAction(data: {
    postId: string;
    ipHash?: string | null;
    userAgent?: string | null;
    referrer?: string | null;
}) {
    const session = await getSession();
    await recordView({
        postId: data.postId,
        userId: session?.user?.id ?? null,
        ipHash: data.ipHash ?? null,
        userAgent: data.userAgent ?? null,
        referrer: data.referrer ?? null,
    });
}

export async function listPublishedPostsAction(filters: PublicPostFilters = {}) {
    const rows = await listPublishedPosts(filters);
    return toPlainArray(rows as Record<string, any>[]);
}

export async function countPublishedPostsAction(
    filters: Omit<PublicPostFilters, "limit" | "offset"> = {}
) {
    return countPublishedPosts(filters);
}
