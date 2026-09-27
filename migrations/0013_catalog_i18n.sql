PRAGMA foreign_keys = ON;

ALTER TABLE categories
  ADD COLUMN name_en TEXT;

ALTER TABLE categories
  ADD COLUMN description_en TEXT;

ALTER TABLE platforms
  ADD COLUMN name_en TEXT;

ALTER TABLE apps
  ADD COLUMN short_description_en TEXT;

ALTER TABLE apps
  ADD COLUMN description_en TEXT;

ALTER TABLE app_links
  ADD COLUMN label_en TEXT;

ALTER TABLE app_screenshots
  ADD COLUMN title_en TEXT;

ALTER TABLE app_screenshots
  ADD COLUMN alt_en TEXT;
