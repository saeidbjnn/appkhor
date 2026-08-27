-- 0008_catalog_search.sql
-- Lightweight search metadata for AppKhor MVP.

ALTER TABLE apps ADD COLUMN search_keywords TEXT;

CREATE INDEX IF NOT EXISTS idx_apps_status_name
  ON apps(status, name);

UPDATE apps
SET search_keywords = 'vlc, video player, media player, audio player, ویدیو پلیر, مدیا پلیر, پخش کننده ویدیو, پخش‌کننده ویدیو, پخش فیلم, پخش ویدیو, پخش موسیقی, پخش کننده چندرسانه ای, پخش‌کننده چندرسانه‌ای'
WHERE id = 'app-vlc';