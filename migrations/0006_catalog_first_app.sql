PRAGMA foreign_keys = ON;

-- =========================
-- First real app: VLC
-- =========================

INSERT OR IGNORE INTO apps (
  id,
  slug,
  name,
  name_fa,
  short_description_fa,
  description_fa,
  logo_url,
  website_url,
  repository_url,
  developer_name,
  license_name,
  status,
  is_featured,
  sort_order,
  published_at
)
VALUES (
  'app-vlc',
  'vlc',
  'VLC media player',
  'VLC',
  'پخش‌کننده آزاد و متن‌باز برای انواع فایل‌های صوتی و تصویری',
  'VLC یک پخش‌کننده چندرسانه‌ای آزاد و متن‌باز است که از فرمت‌های متنوع صوتی و تصویری پشتیبانی می‌کند و روی سیستم‌عامل‌های مختلف در دسترس است.',
  NULL,
  'https://www.videolan.org/vlc/',
  'https://code.videolan.org/videolan/vlc',
  'VideoLAN',
  'GPL-2.0-or-later',
  'PUBLISHED',
  1,
  10,
  CURRENT_TIMESTAMP
);


-- =========================
-- Category
-- =========================

INSERT OR IGNORE INTO app_categories (
  app_id,
  category_id
)
VALUES (
  'app-vlc',
  'cat-multimedia'
);


-- =========================
-- Platforms
-- =========================

INSERT OR IGNORE INTO app_platforms (
  app_id,
  platform_id
)
VALUES
  ('app-vlc', 'platform-windows'),
  ('app-vlc', 'platform-macos'),
  ('app-vlc', 'platform-linux'),
  ('app-vlc', 'platform-android'),
  ('app-vlc', 'platform-ios');


-- =========================
-- Official outbound links
-- =========================

INSERT OR IGNORE INTO app_links (
  id,
  app_id,
  platform_id,
  label_fa,
  url,
  link_type,
  is_primary,
  is_active,
  sort_order
)
VALUES
  (
    'link-vlc-official',
    'app-vlc',
    NULL,
    'دریافت VLC از سایت رسمی',
    'https://www.videolan.org/vlc/',
    'DOWNLOAD',
    1,
    1,
    10
  ),
  (
    'link-vlc-source',
    'app-vlc',
    NULL,
    'مشاهده کد منبع',
    'https://code.videolan.org/videolan/vlc',
    'SOURCE',
    0,
    1,
    20
  );