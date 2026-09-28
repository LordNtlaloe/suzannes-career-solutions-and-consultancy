-- ============================================================
-- Users table (referenced throughout; include here for FK context)
-- ============================================================
CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    role TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'author' | 'moderator' | 'admin'
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- Categories (hierarchical)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id TEXT,
    depth INTEGER NOT NULL DEFAULT 0,     -- denormalized: 0 for root
    path TEXT NOT NULL DEFAULT '',        -- materialized path: '/root/child/leaf/'
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================
-- Tags
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- Posts
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category_id TEXT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image_id TEXT,                  -- FK to media (added later)
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at INTEGER,
    scheduled_at INTEGER,
    -- Denormalized counters (updated via triggers)
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    bookmark_count INTEGER NOT NULL DEFAULT 0,
    -- Review aggregate (updated via triggers on reviews)
    review_count INTEGER NOT NULL DEFAULT 0,
    review_avg REAL NOT NULL DEFAULT 0,   -- 0.00–5.00
    -- Soft delete
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at INTEGER,                   -- when it was soft-deleted
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================
-- Post Versions (history & drafts)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_versions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    version_number INTEGER NOT NULL,
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    created_by TEXT,                      -- user who created this version
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE SET NULL,
    UNIQUE(post_id, version_number)
);

-- ============================================================
-- Post-Tag Junction
-- ============================================================
CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================================
-- Media / Attachments
-- ============================================================
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    post_id TEXT,                         -- nullable: media can exist before attaching
    user_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER,                        -- for images
    height INTEGER,                       -- for images
    url TEXT NOT NULL,
    thumbnail_url TEXT,                   -- optional derived thumbnail
    alt_text TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Now add the FK on posts.cover_image_id (deferred because media declares after posts)
-- SQLite doesn't support ALTER TABLE ADD CONSTRAINT; enforce at query layer.

-- ============================================================
-- Comments (nested replies)
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    parent_id TEXT,
    body TEXT NOT NULL,
    depth INTEGER NOT NULL DEFAULT 0,     -- 0 for top-level
    path TEXT NOT NULL DEFAULT '',        -- materialized path: '/parent/child/'
    like_count INTEGER NOT NULL DEFAULT 0,
    reply_count INTEGER NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- ============================================================
-- Likes (posts & comments)
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT,
    comment_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id, post_id, comment_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- ============================================================
-- Bookmarks
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ============================================================
-- Reviews / Ratings
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    body TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- ============================================================
-- View Analytics (source of truth for views)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_views (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT,
    ip_hash TEXT,                         -- optional: dedupe anonymous viewers
    user_agent TEXT,
    referrer TEXT,
    viewed_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
);

-- ============================================================
-- Indexes
-- ============================================================

-- Posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id      ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id  ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published    ON posts(published, is_deleted);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at)
    WHERE scheduled_at IS NOT NULL AND published = FALSE AND is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_posts_slug         ON posts(slug);

-- Post versions
CREATE INDEX IF NOT EXISTS idx_post_versions_post_id ON post_versions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_versions_draft   ON post_versions(post_id, is_draft);
-- Only one draft per post
CREATE UNIQUE INDEX IF NOT EXISTS uniq_post_versions_draft
    ON post_versions(post_id) WHERE is_draft = TRUE;

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_path      ON categories(path);

-- Post tags
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- Media
CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id       ON comments(post_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_comments_user_id       ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id     ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_depth    ON comments(post_id, depth);

-- Likes
CREATE INDEX IF NOT EXISTS idx_likes_user_id    ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id    ON likes(post_id)    WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_likes_comment_id ON likes(comment_id) WHERE comment_id IS NOT NULL;

-- Bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_post_id ON reviews(post_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Post views
CREATE INDEX IF NOT EXISTS idx_post_views_post_id   ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id   ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_post_views_dedupe    ON post_views(post_id, ip_hash, viewed_at);

-- ============================================================
-- Triggers — keep denormalized counters in sync
-- ============================================================

-- ---- Post like_count ----
CREATE TRIGGER IF NOT EXISTS trg_likes_post_after_insert
AFTER INSERT ON likes
WHEN NEW.post_id IS NOT NULL
BEGIN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_likes_post_after_delete
AFTER DELETE ON likes
WHEN OLD.post_id IS NOT NULL
BEGIN
    UPDATE posts SET like_count = MAX(0, like_count - 1) WHERE id = OLD.post_id;
END;

-- ---- Comment like_count ----
CREATE TRIGGER IF NOT EXISTS trg_likes_comment_after_insert
AFTER INSERT ON likes
WHEN NEW.comment_id IS NOT NULL
BEGIN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_likes_comment_after_delete
AFTER DELETE ON likes
WHEN OLD.comment_id IS NOT NULL
BEGIN
    UPDATE comments SET like_count = MAX(0, like_count - 1) WHERE id = OLD.comment_id;
END;

-- ---- Post comment_count & comment reply_count ----
CREATE TRIGGER IF NOT EXISTS trg_comments_after_insert
AFTER INSERT ON comments
BEGIN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    UPDATE comments SET reply_count = reply_count + 1
        WHERE id = NEW.parent_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_comments_after_delete
AFTER DELETE ON comments
BEGIN
    UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = OLD.post_id;
    UPDATE comments SET reply_count = MAX(0, reply_count - 1)
        WHERE id = OLD.parent_id;
END;

-- ---- Post bookmark_count ----
CREATE TRIGGER IF NOT EXISTS trg_bookmarks_after_insert
AFTER INSERT ON bookmarks
BEGIN
    UPDATE posts SET bookmark_count = bookmark_count + 1 WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_bookmarks_after_delete
AFTER DELETE ON bookmarks
BEGIN
    UPDATE posts SET bookmark_count = MAX(0, bookmark_count - 1) WHERE id = OLD.post_id;
END;

-- ---- Post review aggregates ----
CREATE TRIGGER IF NOT EXISTS trg_reviews_after_insert
AFTER INSERT ON reviews
BEGIN
    UPDATE posts
    SET
        review_count = (SELECT COUNT(*) FROM reviews WHERE post_id = NEW.post_id),
        review_avg   = (SELECT AVG(rating) FROM reviews WHERE post_id = NEW.post_id)
    WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_reviews_after_update
AFTER UPDATE ON reviews
BEGIN
    UPDATE posts
    SET
        review_count = (SELECT COUNT(*) FROM reviews WHERE post_id = NEW.post_id),
        review_avg   = (SELECT AVG(rating) FROM reviews WHERE post_id = NEW.post_id)
    WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_reviews_after_delete
AFTER DELETE ON reviews
BEGIN
    UPDATE posts
    SET
        review_count = (SELECT COUNT(*) FROM reviews WHERE post_id = OLD.post_id),
        review_avg   = COALESCE((SELECT AVG(rating) FROM reviews WHERE post_id = OLD.post_id), 0)
    WHERE id = OLD.post_id;
END;

-- ---- post_views → posts.view_count ----
CREATE TRIGGER IF NOT EXISTS trg_post_views_after_insert
AFTER INSERT ON post_views
BEGIN
    UPDATE posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
END;