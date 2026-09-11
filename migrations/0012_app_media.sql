CREATE TABLE IF NOT EXISTS media_assets (
    id TEXT PRIMARY KEY,

    kind TEXT NOT NULL
        CHECK (kind IN ('LOGO', 'SCREENSHOT')),

    original_filename TEXT,
    content_type TEXT NOT NULL,
    byte_size INTEGER NOT NULL
        CHECK (byte_size > 0),

    data BLOB NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_assets_kind
ON media_assets(kind);

CREATE INDEX IF NOT EXISTS idx_media_assets_created_at
ON media_assets(created_at);
