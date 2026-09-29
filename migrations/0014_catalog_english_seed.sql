PRAGMA foreign_keys = ON;

UPDATE categories
SET
  name_en = 'Productivity',
  description_en = 'Tools for planning, notes, task management, and staying focused.'
WHERE slug = 'productivity';

UPDATE categories
SET
  name_en = 'Development',
  description_en = 'Tools for developers, programming, and software project management.'
WHERE slug = 'development';

UPDATE categories
SET
  name_en = 'Internet & Network',
  description_en = 'Browsers, networking tools, data transfer, and internet services.'
WHERE slug = 'internet-network';

UPDATE categories
SET
  name_en = 'Security & Privacy',
  description_en = 'Security, encryption, password management, and privacy tools.'
WHERE slug = 'security-privacy';

UPDATE categories
SET
  name_en = 'Multimedia',
  description_en = 'Tools for playing, converting, editing, and managing audio and video.'
WHERE slug = 'multimedia';

UPDATE categories
SET
  name_en = 'Design & Creative',
  description_en = 'Tools for design, graphics, images, and creative content production.'
WHERE slug = 'design-creative';

UPDATE categories
SET
  name_en = 'File Management',
  description_en = 'Tools for managing, searching, compressing, and organizing files.'
WHERE slug = 'file-management';

UPDATE categories
SET
  name_en = 'System Tools',
  description_en = 'Utilities for system maintenance, monitoring, and device management.'
WHERE slug = 'system-tools';

UPDATE categories
SET
  name_en = 'Communication',
  description_en = 'Messaging, calling, team collaboration, and online communication tools.'
WHERE slug = 'communication';

UPDATE categories
SET
  name_en = 'Education',
  description_en = 'Tools for learning, studying, research, and education.'
WHERE slug = 'education';

UPDATE platforms
SET name_en = 'Windows'
WHERE slug = 'windows';

UPDATE platforms
SET name_en = 'macOS'
WHERE slug = 'macos';

UPDATE platforms
SET name_en = 'Linux'
WHERE slug = 'linux';

UPDATE platforms
SET name_en = 'Android'
WHERE slug = 'android';

UPDATE platforms
SET name_en = 'iOS'
WHERE slug = 'ios';

UPDATE platforms
SET name_en = 'Web'
WHERE slug = 'web';

UPDATE platforms
SET name_en = 'Browser Extension'
WHERE slug = 'browser-extension';

UPDATE platforms
SET name_en = 'Command Line'
WHERE slug = 'cli';

UPDATE platforms
SET name_en = 'Docker'
WHERE slug = 'docker';
