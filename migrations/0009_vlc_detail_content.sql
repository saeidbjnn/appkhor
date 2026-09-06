-- 0009_vlc_detail_content.sql

UPDATE apps
SET
  logo_url = 'https://images.videolan.org/images/icons-VLC/vlc.mini.svg',
  description_fa = 'VLC media player یکی از شناخته‌شده‌ترین پخش‌کننده‌های چندرسانه‌ای متن‌باز است که توسط پروژه VideoLAN توسعه داده می‌شود. این برنامه برای پخش فایل‌های صوتی و تصویری، دیسک‌ها و جریان‌های شبکه ساخته شده و روی چند سیستم‌عامل مختلف در دسترس است.

یکی از مهم‌ترین ویژگی‌های VLC این است که برای بسیاری از فرمت‌های رایج به نصب Codec Pack جداگانه نیاز ندارد. فرمت‌هایی مثل MP4، MKV، WebM، MP3 و بسیاری از قالب‌های دیگر را می‌تواند مستقیماً پخش کند. همین موضوع باعث شده VLC برای کاربرانی که می‌خواهند بدون تنظیمات پیچیده فایل‌های چندرسانه‌ای مختلف را باز کنند، گزینه‌ای کاربردی باشد.

VLC فقط یک پخش‌کننده ساده نیست. امکان پخش Streamهای شبکه، کار با زیرنویس، کنترل سرعت پخش، تنظیم صدا و تصویر، ساخت Playlist و استفاده از فیلترهای مختلف را هم فراهم می‌کند. همچنین به دلیل متن‌باز بودن پروژه، کد منبع آن در دسترس است و توسعه آن توسط جامعه VideoLAN ادامه دارد.

نسخه دسکتاپ VLC برای Windows، macOS و Linux ارائه می‌شود و نسخه‌های موبایل آن نیز برای Android و iOS وجود دارند. در اپ‌خور لینک‌های دانلودی که به‌صورت مستقیم ارائه می‌شوند به فایل‌های رسمی منتشرشده توسط VideoLAN اشاره می‌کنند و خود اپ‌خور فایل نصب را میزبانی نمی‌کند.'
WHERE id = 'app-vlc';

UPDATE app_links
SET
  label_fa = 'وب‌سایت رسمی VLC',
  url = 'https://www.videolan.org/vlc/',
  link_type = 'WEBSITE',
  platform_id = NULL,
  is_primary = 0,
  sort_order = 90,
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'link-vlc-official';

INSERT INTO app_links (
  id, app_id, platform_id, label_fa, url, link_type,
  is_primary, is_active, sort_order
)
SELECT
  'link-vlc-windows-x64',
  'app-vlc',
  platforms.id,
  'دانلود مستقیم VLC برای ویندوز 64 بیت',
  'https://download.videolan.org/videolan/vlc/3.0.23/win64/vlc-3.0.23-win64.exe',
  'DOWNLOAD',
  1,
  1,
  10
FROM platforms
WHERE platforms.slug = 'windows';

INSERT INTO app_links (
  id, app_id, platform_id, label_fa, url, link_type,
  is_primary, is_active, sort_order
)
SELECT
  'link-vlc-macos-universal',
  'app-vlc',
  platforms.id,
  'دانلود مستقیم VLC برای macOS',
  'https://download.videolan.org/videolan/vlc/3.0.23/macosx/vlc-3.0.23-universal.dmg',
  'DOWNLOAD',
  0,
  1,
  20
FROM platforms
WHERE platforms.slug = 'macos';

INSERT INTO app_links (
  id, app_id, platform_id, label_fa, url, link_type,
  is_primary, is_active, sort_order
)
SELECT
  'link-vlc-android-arm64',
  'app-vlc',
  platforms.id,
  'دانلود مستقیم VLC برای اندروید ARM64',
  'https://download.videolan.org/pub/videolan/vlc-android/3.7.1/VLC-Android-3.7.1-arm64-v8a.apk',
  'DOWNLOAD',
  0,
  1,
  30
FROM platforms
WHERE platforms.slug = 'android';

UPDATE app_links
SET
  sort_order = 100,
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'link-vlc-source';
