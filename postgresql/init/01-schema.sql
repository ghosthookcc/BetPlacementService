CREATE TABLE IF NOT EXISTS app_health (
    id         SMALLINT PRIMARY KEY DEFAULT 1,
    status     TEXT        NOT NULL DEFAULT 'ok',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO app_health (id, status) VALUES (1, 'ok')
ON CONFLICT (id) DO NOTHING;
