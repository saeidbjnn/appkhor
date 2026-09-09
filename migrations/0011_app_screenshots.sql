CREATE TABLE IF NOT EXISTS app_screenshots (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,

    image_url TEXT NOT NULL,
    title_fa TEXT,
    alt_fa TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
        CHECK (is_active IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (app_id)
        REFERENCES apps(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_app_screenshots_app_id
ON app_screenshots(app_id);

CREATE INDEX IF NOT EXISTS idx_app_screenshots_app_sort
ON app_screenshots(app_id, sort_order);