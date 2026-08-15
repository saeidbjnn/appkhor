PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS outbound_clicks (
  id TEXT PRIMARY KEY,

  link_id TEXT NOT NULL,
  user_id TEXT,

  referrer TEXT,
  user_agent TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (link_id)
    REFERENCES app_links(id)
    ON DELETE CASCADE,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_outbound_clicks_link_created
  ON outbound_clicks (
    link_id,
    created_at
  );

CREATE INDEX IF NOT EXISTS idx_outbound_clicks_user_created
  ON outbound_clicks (
    user_id,
    created_at
  );

CREATE INDEX IF NOT EXISTS idx_outbound_clicks_created
  ON outbound_clicks (
    created_at
  );