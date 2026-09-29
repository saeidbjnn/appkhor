PRAGMA foreign_keys = ON;

UPDATE apps
SET
  short_description_en =
    'A free and open-source media player for a wide range of audio and video formats.',
  description_en =
    'VLC media player is a well-known free and open-source multimedia player developed by the VideoLAN project. It can play audio and video files, discs, and network streams, and is available across multiple operating systems.

One of VLC''s key advantages is that it can play many popular media formats without requiring a separate codec pack. It supports formats such as MP4, MKV, WebM, MP3, and many others, making it useful for people who want to open different media files without complicated setup.

VLC is more than a basic media player. It supports network streaming, subtitles, playback speed controls, audio and video adjustments, playlists, and various filters. Because the project is open source, its source code is publicly available and development continues through the VideoLAN community.

The desktop version of VLC is available for Windows, macOS, and Linux, with mobile versions also available for Android and iOS. Download links provided by AppKhor point to official files published by VideoLAN; AppKhor does not host the installation files itself.',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'app-vlc';

UPDATE app_links
SET
  label_en = 'Download VLC for Windows 64-bit',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'link-vlc-windows-x64';

UPDATE app_links
SET
  label_en = 'Download VLC for macOS',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'link-vlc-macos-universal';

UPDATE app_links
SET
  label_en = 'Download VLC for Android ARM64',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'link-vlc-android-arm64';

UPDATE app_links
SET
  label_en = 'Official VLC Website',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'link-vlc-official';

UPDATE app_links
SET
  label_en = 'View Source Code',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'link-vlc-source';
