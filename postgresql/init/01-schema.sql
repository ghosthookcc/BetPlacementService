CREATE TABLE users (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name  TEXT        NOT NULL
);

CREATE TABLE categories (
    id         BIGINT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       TEXT    NOT NULL UNIQUE,
    glyph      TEXT -- UI icon (optional)
);

CREATE TABLE events (
    id          UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id BIGINT        NOT NULL REFERENCES categories (id),
    team_a      TEXT          NOT NULL,
    team_b      TEXT          NOT NULL,
    odds_team_a NUMERIC(6,2)  NOT NULL CHECK (odds_team_a >= 1),
    odds_draw   NUMERIC(6,2)  NOT NULL CHECK (odds_draw   >= 1),
    odds_team_b NUMERIC(6,2)  NOT NULL CHECK (odds_team_b >= 1),
    state       TEXT          NOT NULL DEFAULT 'UPCOMING'
                              CHECK (state IN ('UPCOMING', 'LIVE', 'FINISHED', 'CANCELLED')),
    starts_at   TIMESTAMPTZ
);

CREATE TABLE bets (
    id          BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT        NOT NULL REFERENCES users (id),
    event_id    UUID          NOT NULL REFERENCES events (id),
    request_id  TEXT          NOT NULL UNIQUE, -- idempotency key
    checksum    CHAR(64)      NOT NULL UNIQUE,
    stake       NUMERIC(12,2) NOT NULL CHECK (stake > 0),
    selection   TEXT          NOT NULL CHECK (selection IN ('TEAM_A_WIN', 'TEAM_B_WIN', 'DRAW')),
    odds        NUMERIC(6,2)  NOT NULL CHECK (odds >= 1),
    state       TEXT          NOT NULL DEFAULT 'CREATED'
                              CHECK (state IN ('CREATED', 'CONSUMED', 'SETTLED')),
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE settlements (
    id           BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bet_id       BIGINT        NOT NULL UNIQUE REFERENCES bets (id),
    payout       NUMERIC(12,2) NOT NULL DEFAULT 0, -- payout; 0 until resolved / on loss
    state        TEXT          NOT NULL DEFAULT 'WAITING'
                               CHECK (state IN ('WAITING', 'WON', 'LOST', 'VOID')),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_bets_user_id  ON bets (user_id);
CREATE INDEX idx_bets_event_id ON bets (event_id);
CREATE INDEX idx_bets_state    ON bets (state);

CREATE INDEX idx_settlements_state ON settlements (state);

INSERT INTO users (full_name) VALUES
    ('David Chen'),
    ('Taiga Davids'),
    ('Yuki Nakatani');

INSERT INTO categories (name, glyph) VALUES
    ('Football',   '⚽'),
    ('Basketball', '🏀'),
    ('Tennis',     '🎾'),
    ('Esports',    '🎮');

INSERT INTO events (category_id, team_a, team_b, odds_team_a, odds_draw, odds_team_b, state, starts_at)
SELECT c.id, v.team_a, v.team_b, v.odds_a, v.odds_d, v.odds_b, v.state, v.starts_at
FROM (VALUES
    ('Football',   'Arsenal',       'Chelsea',        2.10, 3.40, 3.20, 'LIVE',     now() - interval '20 minutes'),
    ('Football',   'Liverpool',     'Man City',       2.75, 3.30, 2.45, 'UPCOMING', now() + interval '2 hours'),
    ('Basketball', 'Lakers',        'Celtics',        1.85, 15.0, 1.95, 'LIVE',     now() - interval '10 minutes'),
    ('Basketball', 'Warriors',      'Nuggets',        2.30, 21.0, 1.62, 'UPCOMING', now() + interval '3 hours'),
    ('Tennis',     'Alcaraz',       'Sinner',         1.72, 25.0, 2.10, 'UPCOMING', now() + interval '1 hours'),
    ('Esports',    'NAVI',          'FaZe',           1.90, 30.0, 1.90, 'LIVE',     now() - interval '5 minutes')
) AS v(cat, team_a, team_b, odds_a, odds_d, odds_b, state, starts_at)
JOIN categories c ON c.name = v.cat;
