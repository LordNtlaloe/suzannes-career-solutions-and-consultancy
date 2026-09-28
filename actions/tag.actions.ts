"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    createTag,
    updateTag,
    deleteTag,
    getAllTags,
    getTagsWithPostCounts,
    getPostTags,
    setPostTags,
    addTagToPost,
    removeTagFromPost,
    getOrCreateTag,
    getPopularTags,
    searchTags,
    getTagWithCountBySlug,
} from "@/db/queries/tags";
import Joi from "joi";

const tagSchema = Joi.object({
    name: Joi.string().required().min(1).max(100),
    slug: Joi.string().required().min(1).max(100),
});

async function checkAuth() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user.role || !["admin", "moderator"].includes(session.user.role)) {
        throw new Error("Unauthorized");
    }

    return session;
}

// ---------- Serialization helpers ----------

/**
 * Convert a raw DB row into a plain JSON-safe object.
 * - Coerces bigint → number
 * - Coerces Dates → ISO strings
 * - Ensures the result is a plain object literal
 */
function toPlain<T extends Record<string, any>>(row: T): T {
    const out: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
        if (typeof value === "bigint") {
            out[key] = Number(value);
        } else if (value instanceof Date) {
            out[key] = value.toISOString();
        } else if (value === undefined) {
            out[key] = null;
        } else {
            out[key] = value;
        }
    }
    return out as T;
}

function toPlainArray<T extends Record<string, any>>(rows: T[]): T[] {
    return rows.map(toPlain);
}

// ---------- CRUD ----------

export async function createTagAction(data: { name: string; slug: string }) {
    await checkAuth();

    const { error, value } = tagSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    try {
        const id = await createTag({ name: value.name, slug: value.slug });
        return id; // already a string
    } catch (e: any) {
        const msg = String(e?.message ?? "");
        if (msg.includes("UNIQUE") && msg.includes("slug")) {
            throw new Error("A tag with that slug already exists");
        }
        throw e;
    }
}

export async function updateTagAction(
    id: string,
    data: { name?: string; slug?: string }
) {
    await checkAuth();

    const { error, value } = tagSchema.validate(data, { presence: "optional" });
    if (error) throw new Error(error.details[0].message);

    try {
        return await updateTag(id, value);
    } catch (e: any) {
        const msg = String(e?.message ?? "");
        if (msg.includes("UNIQUE") && msg.includes("slug")) {
            throw new Error("A tag with that slug already exists");
        }
        throw e;
    }
}

export async function deleteTagAction(id: string) {
    await checkAuth();
    await deleteTag(id);
}

// ---------- Read (all serialized) ----------

export async function getTagsAction() {
    const rows = await getAllTags();
    return toPlainArray(rows as Record<string, any>[]);
}

export async function getTagsWithCountsAction() {
    const rows = await getTagsWithPostCounts();
    return toPlainArray(rows as Record<string, any>[]);
}

export async function getPopularTagsAction(limit = 10) {
    const rows = await getPopularTags(limit);
    return toPlainArray(rows as Record<string, any>[]);
}

export async function searchTagsAction(query: string, limit = 10) {
    if (!query.trim()) return [];
    const rows = await searchTags(query, limit);
    return toPlainArray(rows as Record<string, any>[]);
}

// ---------- Post ↔ Tag relations ----------

export async function getPostTagsAction(postId: string) {
    const rows = await getPostTags(postId);
    return toPlainArray(rows as Record<string, any>[]);
}

export async function setPostTagsAction(postId: string, tagIds: string[]) {
    await checkAuth();
    await setPostTags(postId, tagIds);
}

export async function addTagToPostAction(postId: string, tagId: string) {
    await checkAuth();
    await addTagToPost(postId, tagId);
}

export async function removeTagFromPostAction(postId: string, tagId: string) {
    await checkAuth();
    await removeTagFromPost(postId, tagId);
}

export async function getOrCreateTagAction(data: { name: string; slug: string }) {
    await checkAuth();

    const { error, value } = tagSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const id = await getOrCreateTag({
        name: value.name,
        slug: value.slug,
    });
    return id; // string
}

export async function getTagWithCountBySlugAction(slug: string) {
    const row = await getTagWithCountBySlug(slug);
    return row ? toPlain(row) : null;
}