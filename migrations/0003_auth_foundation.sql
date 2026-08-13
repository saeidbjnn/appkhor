-- =========================================================
-- AppKhor Auth Foundation
-- Migration: 0003_auth_foundation.sql
--
-- IMPORTANT:
-- This migration is intentionally backward-compatible.
-- Legacy auth columns are NOT removed yet.
-- =========================================================


-- =========================================================
-- 1. Extend users table
-- =========================================================

ALTER TABLE users
ADD COLUMN display_name TEXT;

ALTER TABLE users
ADD COLUMN avatar_url TEXT;

-- Keep legacy users.email for now.
-- primary_email will become the canonical account email later.
ALTER TABLE users
ADD COLUMN primary_email TEXT COLLATE NOCASE;

-- Phone login is not enabled yet, but the schema is prepared.
ALTER TABLE users
ADD COLUMN phone TEXT;

ALTER TABLE users
ADD COLUMN phone_verified_at TEXT;

-- New account role system.
ALTER TABLE users
ADD COLUMN account_role TEXT NOT NULL DEFAULT 'USER'
    CHECK (
        account_role IN (
            'USER',
            'ADMIN',
            'SUPER_ADMIN'
        )
    );

-- New account status system.
ALTER TABLE users
ADD COLUMN account_status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (
        account_status IN (
            'ACTIVE',
            'SUSPENDED',
            'DELETED'
        )
    );


-- =========================================================
-- 2. Backfill existing users
-- =========================================================

UPDATE users
SET primary_email = email
WHERE primary_email IS NULL;


-- Legacy:
-- user  -> USER
-- admin -> ADMIN
--
-- SUPER_ADMIN will be assigned explicitly later.
UPDATE users
SET account_role =
    CASE
        WHEN role = 'admin' THEN 'ADMIN'
        ELSE 'USER'
    END;


-- Legacy:
-- is_active = 1 -> ACTIVE
-- is_active = 0 -> SUSPENDED
UPDATE users
SET account_status =
    CASE
        WHEN is_active = 0 THEN 'SUSPENDED'
        ELSE 'ACTIVE'
    END;


-- =========================================================
-- 3. User indexes
-- =========================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_primary_email_unique
ON users(primary_email COLLATE NOCASE)
WHERE primary_email IS NOT NULL;


CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique
ON users(phone)
WHERE phone IS NOT NULL;


CREATE INDEX IF NOT EXISTS idx_users_account_role
ON users(account_role);


CREATE INDEX IF NOT EXISTS idx_users_account_status
ON users(account_status);


-- =========================================================
-- 4. Authentication identities
--
-- One AppKhor user may authenticate through:
-- EMAIL_PASSWORD
-- PHONE_PASSWORD
-- GOOGLE
-- GITHUB
-- =========================================================

CREATE TABLE IF NOT EXISTS auth_identities (
    id TEXT PRIMARY KEY,

    user_id TEXT NOT NULL,

    provider TEXT NOT NULL
        CHECK (
            provider IN (
                'EMAIL_PASSWORD',
                'PHONE_PASSWORD',
                'GOOGLE',
                'GITHUB'
            )
        ),

    -- Stable identifier from the provider.
    --
    -- EMAIL_PASSWORD -> normalized email
    -- PHONE_PASSWORD -> normalized phone
    -- GOOGLE         -> Google "sub"
    -- GITHUB         -> GitHub numeric user id
    provider_user_id TEXT NOT NULL,

    provider_email TEXT COLLATE NOCASE,

    provider_username TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_used_at TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE (provider, provider_user_id),

    -- MVP: one identity from each provider per AppKhor account.
    UNIQUE (user_id, provider)
);


CREATE INDEX IF NOT EXISTS idx_auth_identities_user_id
ON auth_identities(user_id);


CREATE INDEX IF NOT EXISTS idx_auth_identities_provider_email
ON auth_identities(provider_email);


-- =========================================================
-- 5. Backfill email/password identities
-- =========================================================

INSERT OR IGNORE INTO auth_identities (
    id,
    user_id,
    provider,
    provider_user_id,
    provider_email
)
SELECT
    id || ':email-password',
    id,
    'EMAIL_PASSWORD',
    lower(email),
    email
FROM users;


-- =========================================================
-- 6. Password credentials
--
-- Password hashes are copied from legacy users.password_hash.
-- The old column stays in users until the migration is complete.
-- =========================================================

CREATE TABLE IF NOT EXISTS password_credentials (
    id TEXT PRIMARY KEY,

    user_id TEXT NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    password_changed_at TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


INSERT OR IGNORE INTO password_credentials (
    id,
    user_id,
    password_hash
)
SELECT
    id || ':password',
    id,
    password_hash
FROM users;

INSERT OR IGNORE INTO password_credentials (
    id,
    user_id,
    password_hash
)
SELECT
    id || ':password',
    id,
    password_hash
FROM users;


-- =========================================================
-- 7. Password reset tokens
-- =========================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,

    user_id TEXT NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TEXT NOT NULL,

    used_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
ON password_reset_tokens(user_id);


CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at
ON password_reset_tokens(expires_at);


-- =========================================================
-- 8. Extend sessions
-- =========================================================

ALTER TABLE sessions
ADD COLUMN last_used_at TEXT;


-- Store only a derived/hash representation if this is used later.
-- Never store sensitive raw network data unnecessarily.
ALTER TABLE sessions
ADD COLUMN ip_hash TEXT;


CREATE INDEX IF NOT EXISTS idx_sessions_last_used_at
ON sessions(last_used_at);


-- =========================================================
-- 9. Audit logs
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,

    actor_user_id TEXT,

    action TEXT NOT NULL,

    target_type TEXT NOT NULL,

    target_id TEXT,

    old_value TEXT,

    new_value TEXT,

    reason TEXT,

    -- JSON serialized as TEXT when structured metadata is needed.
    metadata TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (actor_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id
ON audit_logs(actor_user_id);


CREATE INDEX IF NOT EXISTS idx_audit_logs_target
ON audit_logs(target_type, target_id);


CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
ON audit_logs(created_at);