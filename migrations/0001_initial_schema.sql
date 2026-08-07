-- کاربران عادی و مدیران
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,

    role TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin')),

    is_active INTEGER NOT NULL DEFAULT 1
        CHECK (is_active IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
);

-- نشست‌های ورود
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- سریع‌ترشدن جست‌وجوی کاربر با ایمیل
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- سریع‌ترشدن پیدا کردن نشست‌های هر کاربر
CREATE INDEX IF NOT EXISTS idx_sessions_user_id
ON sessions(user_id);

-- سریع‌ترشدن بررسی توکن ورود
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash
ON sessions(token_hash);

-- سریع‌ترشدن پاک‌کردن نشست‌های منقضی
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
ON sessions(expires_at);