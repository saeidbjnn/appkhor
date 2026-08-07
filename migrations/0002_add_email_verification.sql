-- وضعیت تأیید ایمیل کاربر
ALTER TABLE users
ADD COLUMN email_verified_at TEXT;

-- زمان ارسال ایمیل خوش‌آمدگویی
ALTER TABLE users
ADD COLUMN welcome_email_sent_at TEXT;

-- کدهای تأیید ایمیل
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,

    attempts INTEGER NOT NULL DEFAULT 0
        CHECK (attempts >= 0),

    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_verification_user_id
ON email_verification_codes(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_expires_at
ON email_verification_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_email_verification_code_hash
ON email_verification_codes(code_hash);