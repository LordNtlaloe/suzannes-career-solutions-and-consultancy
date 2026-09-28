import { getPostById } from "@/db/queries/posts"

/**
 * Returns true if the given session user can view this post in its current state.
 * Rules:
 *   - Deleted posts: only staff (admin/moderator) can view.
 *   - Unpublished (draft/scheduled): only author or staff.
 *   - Published: anyone.
 */
export async function canViewPost(
    postId: string,
    user?: { id: string; role?: string | null } | null
) {
    const post = await getPostById(postId)
    if (!post) return { ok: false as const, post: null }

    const isStaff =
        user?.role === "admin" || user?.role === "moderator"
    const isAuthor = user?.id === post.user_id

    if (post.is_deleted) {
        return { ok: isStaff, post }
    }
    if (!post.published) {
        return { ok: isAuthor || isStaff, post }
    }
    return { ok: true as const, post }
}