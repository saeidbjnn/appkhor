PRAGMA foreign_keys = ON;

-- =========================
-- Categories
-- =========================

INSERT OR IGNORE INTO categories (
  id,
  slug,
  name_fa,
  description_fa,
  icon,
  sort_order,
  is_active
)
VALUES
  (
    'cat-productivity',
    'productivity',
    'بهره‌وری',
    'ابزارهای برنامه‌ریزی، یادداشت، مدیریت کار و افزایش تمرکز',
    'sparkles',
    10,
    1
  ),
  (
    'cat-development',
    'development',
    'توسعه و برنامه‌نویسی',
    'ابزارهای مناسب توسعه‌دهندگان، برنامه‌نویسی و مدیریت پروژه‌های نرم‌افزاری',
    'code',
    20,
    1
  ),
  (
    'cat-internet-network',
    'internet-network',
    'اینترنت و شبکه',
    'مرورگرها، ابزارهای شبکه، انتقال داده و سرویس‌های اینترنتی',
    'globe',
    30,
    1
  ),
  (
    'cat-security-privacy',
    'security-privacy',
    'امنیت و حریم خصوصی',
    'ابزارهای امنیتی، رمزنگاری، مدیریت رمز عبور و حریم خصوصی',
    'shield',
    40,
    1
  ),
  (
    'cat-multimedia',
    'multimedia',
    'چندرسانه‌ای',
    'پخش، تبدیل، ویرایش و مدیریت فایل‌های صوتی و تصویری',
    'play',
    50,
    1
  ),
  (
    'cat-design-creative',
    'design-creative',
    'طراحی و خلاقیت',
    'ابزارهای طراحی، تصویر، گرافیک و تولید محتوای خلاقانه',
    'palette',
    60,
    1
  ),
  (
    'cat-file-management',
    'file-management',
    'مدیریت فایل',
    'ابزارهای مدیریت، جستجو، فشرده‌سازی و سازمان‌دهی فایل‌ها',
    'folder',
    70,
    1
  ),
  (
    'cat-system-tools',
    'system-tools',
    'سیستم و ابزارها',
    'ابزارهای کاربردی سیستم، نگهداری، مانیتورینگ و مدیریت دستگاه',
    'settings',
    80,
    1
  ),
  (
    'cat-communication',
    'communication',
    'ارتباطات',
    'پیام‌رسان‌ها، تماس، همکاری تیمی و ارتباطات آنلاین',
    'message-circle',
    90,
    1
  ),
  (
    'cat-education',
    'education',
    'آموزش',
    'ابزارهای یادگیری، مطالعه، پژوهش و آموزش',
    'graduation-cap',
    100,
    1
  );


-- =========================
-- Platforms
-- =========================

INSERT OR IGNORE INTO platforms (
  id,
  slug,
  name_fa,
  icon,
  sort_order,
  is_active
)
VALUES
  (
    'platform-windows',
    'windows',
    'ویندوز',
    'windows',
    10,
    1
  ),
  (
    'platform-macos',
    'macos',
    'mac‌اواس',
    'apple',
    20,
    1
  ),
  (
    'platform-linux',
    'linux',
    'لینوکس',
    'linux',
    30,
    1
  ),
  (
    'platform-android',
    'android',
    'اندروید',
    'smartphone',
    40,
    1
  ),
  (
    'platform-ios',
    'ios',
    'iOS',
    'smartphone',
    50,
    1
  ),
  (
    'platform-web',
    'web',
    'وب',
    'globe',
    60,
    1
  ),
  (
    'platform-browser-extension',
    'browser-extension',
    'افزونه مرورگر',
    'puzzle',
    70,
    1
  ),
  (
    'platform-cli',
    'cli',
    'خط فرمان',
    'terminal',
    80,
    1
  ),
  (
    'platform-docker',
    'docker',
    'Docker',
    'container',
    90,
    1
  );