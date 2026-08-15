PRAGMA foreign_keys = ON;

-- =========================
-- Categories
-- =========================

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name_fa TEXT NOT NULL,
  description_fa TEXT,
  icon TEXT,

  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
    CHECK (is_active IN (0, 1)),

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_active_sort
  ON categories (is_active, sort_order);


-- =========================
-- Platforms
-- =========================

CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name_fa TEXT NOT NULL,
  icon TEXT,

  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
    CHECK (is_active IN (0, 1)),

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_platforms_active_sort
  ON platforms (is_active, sort_order);


-- =========================
-- Apps
-- =========================

CREATE TABLE IF NOT EXISTS apps (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE COLLATE NOCASE,

  name TEXT NOT NULL,
  name_fa TEXT,

  short_description_fa TEXT NOT NULL,
  description_fa TEXT,

  logo_url TEXT,
  website_url TEXT,
  repository_url TEXT,

  developer_name TEXT,
  license_name TEXT,

  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (
      status IN (
        'DRAFT',
        'PUBLISHED',
        'ARCHIVED'
      )
    ),

  is_featured INTEGER NOT NULL DEFAULT 0
    CHECK (is_featured IN (0, 1)),

  sort_order INTEGER NOT NULL DEFAULT 0,

  published_at TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_apps_status
  ON apps (status);

CREATE INDEX IF NOT EXISTS idx_apps_status_published
  ON apps (status, published_at);

CREATE INDEX IF NOT EXISTS idx_apps_featured
  ON apps (status, is_featured, sort_order);


-- =========================
-- App <-> Categories
-- =========================

CREATE TABLE IF NOT EXISTS app_categories (
  app_id TEXT NOT NULL,
  category_id TEXT NOT NULL,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (app_id, category_id),

  FOREIGN KEY (app_id)
    REFERENCES apps(id)
    ON DELETE CASCADE,

  FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_app_categories_category
  ON app_categories (category_id, app_id);


-- =========================
-- App <-> Platforms
-- =========================

CREATE TABLE IF NOT EXISTS app_platforms (
  app_id TEXT NOT NULL,
  platform_id TEXT NOT NULL,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (app_id, platform_id),

  FOREIGN KEY (app_id)
    REFERENCES apps(id)
    ON DELETE CASCADE,

  FOREIGN KEY (platform_id)
    REFERENCES platforms(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_app_platforms_platform
  ON app_platforms (platform_id, app_id);


-- =========================
-- Official outbound links
-- /go/{link_id}
-- =========================

CREATE TABLE IF NOT EXISTS app_links (
  id TEXT PRIMARY KEY,

  app_id TEXT NOT NULL,
  platform_id TEXT,

  label_fa TEXT NOT NULL,
  url TEXT NOT NULL,

  link_type TEXT NOT NULL DEFAULT 'OTHER'
    CHECK (
      link_type IN (
        'DOWNLOAD',
        'RUN',
        'WEBSITE',
        'SOURCE',
        'DOCS',
        'STORE',
        'OTHER'
      )
    ),

  is_primary INTEGER NOT NULL DEFAULT 0
    CHECK (is_primary IN (0, 1)),

  is_active INTEGER NOT NULL DEFAULT 1
    CHECK (is_active IN (0, 1)),

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (app_id)
    REFERENCES apps(id)
    ON DELETE CASCADE,

  FOREIGN KEY (platform_id)
    REFERENCES platforms(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_app_links_app
  ON app_links (
    app_id,
    is_active,
    sort_order
  );

CREATE INDEX IF NOT EXISTS idx_app_links_platform
  ON app_links (
    platform_id,
    is_active
  );