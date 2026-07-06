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
    state       TEXT          NOT NULL DEFAULT 'PENDING'
                              CHECK (state IN ('PENDING', 'CONSUMED', 'SETTLED', 'EXPIRED')),
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