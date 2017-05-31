DROP TABLE IF EXISTS videos;
CREATE TABLE videos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  v_name_id INTEGER NOT NULL,
  path      TEXT    NOT NULL UNIQUE,
  FOREIGN KEY (v_name_id) REFERENCES video_names (id)
    ON DELETE CASCADE
);

DROP TABLE IF EXISTS video_names;
CREATE TABLE video_names (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,
  year      INTEGER,
  tmdb_id   INTEGER UNIQUE,
  image_url TEXT,
  overview  TEXT,
  UNIQUE (name, year)
);

DROP TABLE IF EXISTS movies;
CREATE TABLE movies (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL UNIQUE,
  FOREIGN KEY (video_id) REFERENCES videos (id)
    ON DELETE CASCADE
);

DROP TABLE IF EXISTS shows;
CREATE TABLE shows (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL UNIQUE,
  FOREIGN KEY (video_id) REFERENCES videos (id)
    ON DELETE CASCADE
);

DROP TABLE IF EXISTS shows_seasons;
CREATE TABLE shows_seasons (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id   INTEGER NOT NULL,
  season    INTEGER NOT NULL,
  image_url TEXT    NOT NULL,
  overview  TEXT,
  FOREIGN KEY (show_id) REFERENCES shows (id)
    ON DELETE CASCADE,
  UNIQUE (show_id, season)
);

DROP TABLE IF EXISTS shows_episodes;
CREATE TABLE shows_episodes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id   INTEGER NOT NULL,
  season    INTEGER NOT NULL,
  episode   INTEGER NOT NULL,
  image_url TEXT    NOT NULL,
  overview  TEXT,
  FOREIGN KEY (show_id) REFERENCES shows (id),
  FOREIGN KEY (season) REFERENCES shows_seasons
    ON DELETE CASCADE,
  UNIQUE (show_id, season, episode)
);

DROP TABLE IF EXISTS directories;
CREATE TABLE directories (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL UNIQUE
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL
);