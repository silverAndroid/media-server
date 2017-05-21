DROP TABLE IF EXISTS videos;
CREATE TABLE videos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  v_name_id INTEGER NOT NULL,
  path      TEXT    NOT NULL UNIQUE,
  FOREIGN KEY (v_name_id) REFERENCES video_names (id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS video_names;
CREATE TABLE video_names (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  year INTEGER,
  UNIQUE (name, year)
);

DROP TABLE IF EXISTS movies;
CREATE TABLE movies (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL,
  FOREIGN KEY (video_id) REFERENCES videos (id)
    ON DELETE CASCADE
);

DROP TABLE IF EXISTS shows;
CREATE TABLE shows (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  season   INTEGER NOT NULL,
  episode  INTEGER NOT NULL,
  video_id INTEGER NOT NULL,
  FOREIGN KEY (video_id) REFERENCES videos (id)
    ON DELETE CASCADE,
  UNIQUE (season, episode, video_id)
);

DROP TABLE IF EXISTS directories;
CREATE TABLE directories (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL UNIQUE
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT    NOT NULL,
  password   TEXT    NOT NULL,
  created_at INTEGER NOT NULL    DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL    DEFAULT (strftime('%s', 'now'))
);