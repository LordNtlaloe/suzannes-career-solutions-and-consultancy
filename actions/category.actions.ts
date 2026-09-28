"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategoriesWithChildren,
    getCategoryPathToRoot,
    getCategoriesWithPostCounts,
} from "@/db/queries/categories";
import Joi from "joi";

const categorySchema = Joi.object({
    name: Joi.string().required().min(1).max(255),
    slug: Joi.string().required().min(1).max(255),
    description: Joi.string().allow("").max(1000),
    parentId: Joi.string().allow("").optional(),
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

function serializeTree(nodes: any[]): any[] {
    return nodes.map((n) => ({
        ...toPlain(n),
        children: n.children ? serializeTree(n.children) : [],
    }));
}

// ---------- CRUD ----------

export async function createCategoryAction(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
}) {
    await checkAuth();

    const { error, value } = categorySchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    try {
        const id = await createCategory({
            name: value.name,
            slug: value.slug,
            description: value.description || undefined,
            parentId: value.parentId || undefined,
        });
        return id;
    } catch (e: any) {
        const msg = String(e?.message ?? "");
        if (msg.includes("UNIQUE") && msg.includes("slug")) {
            throw new Error("A category with that slug already exists");
        }
        throw e;
    }
}

export async function updateCategoryAction(
    id: string,
    data: {
        name?: string;
        slug?: string;
        description?: string;
        parentId?: string;
    }
) {
    await checkAuth();

    const { error, value } = categorySchema.validate(data, { presence: "optional" });
    if (error) throw new Error(error.details[0].message);

    if (value.parentId) {
        if (value.parentId === id) {
            throw new Error("A category cannot be its own parent");
        }
        const path = await getCategoryPathToRoot(value.parentId);
        if (path.some((p: any) => p.id === id)) {
            throw new Error("Cannot set a descendant as parent");
        }
    }

    try {
        return await updateCategory(id, value);
    } catch (e: any) {
        const msg = String(e?.message ?? "");
        if (msg.includes("UNIQUE") && msg.includes("slug")) {
            throw new Error("A category with that slug already exists");
        }
        throw e;
    }
}

export async function deleteCategoryAction(id: string) {
    await checkAuth();
    await deleteCategory(id);
}

// ---------- Read (serialized) ----------

export async function getCategoriesAction() {
    const categories = await getAllCategoriesWithChildren();
    return serializeTree(categories as any[]);
}

export async function getCategoriesWithCountsAction() {
    const rows = await getCategoriesWithPostCounts();
    return (rows as Record<string, any>[]).map(toPlain);
}