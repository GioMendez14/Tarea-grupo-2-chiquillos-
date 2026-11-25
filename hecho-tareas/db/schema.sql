-- Esquema de la base de datos (PostgreSQL). Es seguro ejecutarlo varias veces.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(120) NOT NULL,
  description TEXT,
  priority    VARCHAR(6)   NOT NULL DEFAULT 'MEDIUM'
              CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  due_date    DATE,
  completed   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Casi todas las consultas filtran por dueño y estado o por dueño y fecha
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks (user_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due       ON tasks (user_id, due_date);
