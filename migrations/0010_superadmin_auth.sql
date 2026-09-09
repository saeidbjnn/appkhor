CREATE TABLE IF NOT EXISTS superadmin_login_codes (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE,
    code_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,

    attempts INTEGER NOT NULL DEFAULT 0
        CHECK (attempts >= 0),

    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_superadmin_login_codes_email
ON superadmin_login_codes(email);

CREATE INDEX IF NOT EXISTS idx_superadmin_login_codes_expires_at
ON superadmin_login_codes(expires_at);


CREATE TABLE IF NOT EXISTS superadmin_sessions (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    last_used_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_email
ON superadmin_sessions(email);

CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_token_hash
ON superadmin_sessions(token_hash);

CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_expires_at
ON superadmin_sessions(expires_at);