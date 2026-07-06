INSERT INTO users (full_name) VALUES
    ('David Chen'),
    ('Taiga Davids'),
    ('Yuki Nakatani'),
    ('Emma Johansson'),
    ('Oliver Andersson'),
    ('Lucas Bergström'),
    ('Sofia Nilsson'),
    ('Hugo Larsson'),
    ('Maja Eriksson'),
    ('Noah Karlsson');
 
INSERT INTO categories (name, glyph) VALUES
    ('Football',   '⚽'),
    ('Basketball', '🏀'),
    ('Tennis',     '🎾'),
    ('Esports',    '🎮'),
    ('Ice Hockey', '🏒'),
    ('Handball',   '🤾');
 
INSERT INTO events (category_id, team_a, team_b, odds_team_a, odds_draw, odds_team_b, state, starts_at)
SELECT c.id, v.team_a, v.team_b, v.odds_a, v.odds_d, v.odds_b, v.state, v.starts_at
FROM (VALUES
    -- FOOTBALL
    ('Football',   'Arsenal',      'Chelsea',       2.10, 3.40, 3.20, 'LIVE',      now() + interval '20 minutes'),
    ('Football',   'Liverpool',    'Man City',      2.75, 3.30, 2.45, 'UPCOMING',  now() + interval '2 hours'),
    ('Football',   'Barcelona',    'Real Madrid',   2.40, 3.60, 2.80, 'FINISHED',  now() - interval '2 days'),
    ('Football',   'PSG',          'Bayern',        2.60, 3.50, 2.50, 'CANCELLED', now() - interval '1 day'),
    ('Football',   'Inter',        'Juventus',      2.35, 3.15, 3.05, 'UPCOMING',  now() + interval '5 hours'),
    ('Football',   'Dortmund',     'Leipzig',       2.05, 3.70, 3.40, 'UPCOMING',  now() + interval '8 hours'),
    ('Football',   'Napoli',       'Roma',          2.15, 3.25, 3.35, 'FINISHED',  now() - interval '4 days'),
    ('Football',   'Ajax',         'PSV',           2.50, 3.45, 2.60, 'FINISHED',  now() - interval '6 days'),
    ('Football',   'Milan',        'Lazio',         1.95, 3.55, 3.80, 'UPCOMING',  now() + interval '1 day'),
    -- BASKETBALL
    ('Basketball', 'Lakers',       'Celtics',       1.85, 15.0, 1.95, 'LIVE',      now() + interval '10 minutes'),
    ('Basketball', 'Warriors',     'Nuggets',       2.30, 21.0, 1.62, 'UPCOMING',  now() + interval '3 hours'),
    ('Basketball', 'Bulls',        'Heat',          2.05, 18.0, 1.75, 'FINISHED',  now() - interval '3 days'),
    ('Basketball', 'Suns',         'Mavericks',     1.90, 19.0, 1.90, 'UPCOMING',  now() + interval '7 hours'),
    ('Basketball', 'Bucks',        'Nets',          1.70, 20.0, 2.15, 'FINISHED',  now() - interval '5 days'),
    ('Basketball', 'Clippers',     'Kings',         2.25, 17.0, 1.65, 'LIVE',      now() + interval '15 minutes'),
    -- TENNIS
    ('Tennis',     'Alcaraz',      'Sinner',        1.72, 25.0, 2.10, 'UPCOMING',  now() + interval '1 hour'),
    ('Tennis',     'Djokovic',     'Medvedev',      1.55, 28.0, 2.40, 'FINISHED',  now() - interval '5 days'),
    ('Tennis',     'Swiatek',      'Sabalenka',     1.95, 26.0, 1.85, 'UPCOMING',  now() + interval '90 minutes'),
    ('Tennis',     'Zverev',       'Rublev',        2.05, 27.0, 1.80, 'FINISHED',  now() - interval '7 days'),
    ('Tennis',     'Gauff',        'Rybakina',      1.88, 24.0, 1.92, 'UPCOMING',  now() + interval '10 hours'),
    -- ESPORTS
    ('Esports',    'NAVI',         'FaZe',          1.90, 30.0, 1.90, 'LIVE',      now() + interval '5 minutes'),
    ('Esports',    'G2',           'Cloud9',        2.10, 12.0, 1.80, 'UPCOMING',  now() + interval '6 hours'),
    ('Esports',    'Vitality',     'MOUZ',          1.75, 34.0, 2.05, 'UPCOMING',  now() + interval '3 hours'),
    ('Esports',    'Astralis',     'Heroic',        1.95, 29.0, 1.85, 'FINISHED',  now() - interval '2 days'),
    ('Esports',    'Liquid',       'FURIA',         2.20, 31.0, 1.68, 'LIVE',      now() + interval '12 minutes'),
    -- ICE HOCKEY
    ('Ice Hockey', 'Färjestad',    'Frölunda',      2.20, 3.10, 2.90, 'FINISHED',  now() - interval '1 day'),
    ('Ice Hockey', 'DIF',          'AIK',           1.95, 3.20, 3.10, 'LIVE',      now() + interval '30 minutes'),
    ('Ice Hockey', 'Skellefteå',   'Luleå',         2.10, 3.15, 3.00, 'UPCOMING',  now() + interval '4 hours'),
    ('Ice Hockey', 'HV71',         'Rögle',         2.35, 3.05, 2.75, 'FINISHED',  now() - interval '3 days'),
    -- HANDBALL
    ('Handball',   'Barcelona HB', 'PSG HB',        1.80, 8.50, 2.10, 'UPCOMING',  now() + interval '4 hours'),
    ('Handball',   'Aalborg',      'Kiel',          2.00, 7.50, 1.85, 'FINISHED',  now() - interval '2 days'),
    ('Handball',   'Veszprém',     'Kielce',        1.90, 8.00, 1.95, 'UPCOMING',  now() + interval '9 hours'),
    ('Handball',   'Flensburg',    'Magdeburg',     2.15, 7.80, 1.78, 'FINISHED',  now() - interval '4 days')
) AS v(cat, team_a, team_b, odds_a, odds_d, odds_b, state, starts_at)
JOIN categories c ON c.name = v.cat;
 
-- BET 1: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0001', 'b000000000000000000000000000000000000000000000000000000000000001', 100.00, 'TEAM_A_WIN', 2.40, 'SETTLED', now() - interval '2 days'
FROM users u, events e WHERE u.full_name = 'David Chen' AND e.team_a = 'Barcelona' AND e.team_b = 'Real Madrid';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 240.00, 'WON', now() - interval '2 days'
FROM bets b WHERE b.request_id = 'seed-req-0001';
 
-- BET 2: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0002', 'b000000000000000000000000000000000000000000000000000000000000002', 50.00, 'DRAW', 3.60, 'SETTLED', now() - interval '6 days'
FROM users u, events e WHERE u.full_name = 'Oliver Andersson' AND e.team_a = 'Barcelona' AND e.team_b = 'Real Madrid';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '6 days'
FROM bets b WHERE b.request_id = 'seed-req-0002';
 
-- BET 3: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0003', 'b000000000000000000000000000000000000000000000000000000000000003', 25.00, 'TEAM_B_WIN', 3.35, 'SETTLED', now() - interval '1 days'
FROM users u, events e WHERE u.full_name = 'Noah Karlsson' AND e.team_a = 'Napoli' AND e.team_b = 'Roma';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 83.75, 'WON', now() - interval '1 days'
FROM bets b WHERE b.request_id = 'seed-req-0003';
 
-- BET 4: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0004', 'b000000000000000000000000000000000000000000000000000000000000004', 100.00, 'TEAM_A_WIN', 2.15, 'SETTLED', now() - interval '2 days'
FROM users u, events e WHERE u.full_name = 'Sofia Nilsson' AND e.team_a = 'Napoli' AND e.team_b = 'Roma';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '2 days'
FROM bets b WHERE b.request_id = 'seed-req-0004';
 
-- BET 5: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0005', 'b000000000000000000000000000000000000000000000000000000000000005', 500.00, 'DRAW', 3.45, 'SETTLED', now() - interval '4 days'
FROM users u, events e WHERE u.full_name = 'Maja Eriksson' AND e.team_a = 'Ajax' AND e.team_b = 'PSV';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 1725.00, 'WON', now() - interval '4 days'
FROM bets b WHERE b.request_id = 'seed-req-0005';
 
-- BET 6: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0006', 'b000000000000000000000000000000000000000000000000000000000000006', 300.00, 'TEAM_A_WIN', 2.50, 'SETTLED', now() - interval '5 days'
FROM users u, events e WHERE u.full_name = 'Emma Johansson' AND e.team_a = 'Ajax' AND e.team_b = 'PSV';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '5 days'
FROM bets b WHERE b.request_id = 'seed-req-0006';
 
-- BET 7: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0007', 'b000000000000000000000000000000000000000000000000000000000000007', 150.00, 'TEAM_B_WIN', 1.75, 'SETTLED', now() - interval '3 days'
FROM users u, events e WHERE u.full_name = 'David Chen' AND e.team_a = 'Bulls' AND e.team_b = 'Heat';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 262.50, 'WON', now() - interval '3 days'
FROM bets b WHERE b.request_id = 'seed-req-0007';
 
-- BET 8: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0008', 'b000000000000000000000000000000000000000000000000000000000000008', 100.00, 'TEAM_A_WIN', 2.05, 'SETTLED', now() - interval '7 days'
FROM users u, events e WHERE u.full_name = 'Yuki Nakatani' AND e.team_a = 'Bulls' AND e.team_b = 'Heat';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '7 days'
FROM bets b WHERE b.request_id = 'seed-req-0008';
 
-- BET 9: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0009', 'b000000000000000000000000000000000000000000000000000000000000009', 50.00, 'DRAW', 18.00, 'SETTLED', now() - interval '1 days'
FROM users u, events e WHERE u.full_name = 'Sofia Nilsson' AND e.team_a = 'Bulls' AND e.team_b = 'Heat';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '1 days'
FROM bets b WHERE b.request_id = 'seed-req-0009';
 
-- BET 10: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0010', 'b000000000000000000000000000000000000000000000000000000000000010', 120.00, 'TEAM_A_WIN', 1.70, 'SETTLED', now() - interval '7 days'
FROM users u, events e WHERE u.full_name = 'Taiga Davids' AND e.team_a = 'Bucks' AND e.team_b = 'Nets';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 204.00, 'WON', now() - interval '7 days'
FROM bets b WHERE b.request_id = 'seed-req-0010';
 
-- BET 11: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0011', 'b000000000000000000000000000000000000000000000000000000000000011', 300.00, 'DRAW', 20.00, 'SETTLED', now() - interval '5 days'
FROM users u, events e WHERE u.full_name = 'Lucas Bergström' AND e.team_a = 'Bucks' AND e.team_b = 'Nets';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '5 days'
FROM bets b WHERE b.request_id = 'seed-req-0011';
 
-- BET 12: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0012', 'b000000000000000000000000000000000000000000000000000000000000012', 200.00, 'DRAW', 20.00, 'SETTLED', now() - interval '1 days'
FROM users u, events e WHERE u.full_name = 'Maja Eriksson' AND e.team_a = 'Bucks' AND e.team_b = 'Nets';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '1 days'
FROM bets b WHERE b.request_id = 'seed-req-0012';
 
-- BET 13: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0013', 'b000000000000000000000000000000000000000000000000000000000000013', 50.00, 'TEAM_A_WIN', 1.55, 'SETTLED', now() - interval '1 days'
FROM users u, events e WHERE u.full_name = 'Noah Karlsson' AND e.team_a = 'Djokovic' AND e.team_b = 'Medvedev';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 77.50, 'WON', now() - interval '1 days'
FROM bets b WHERE b.request_id = 'seed-req-0013';
 
-- BET 14: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0014', 'b000000000000000000000000000000000000000000000000000000000000014', 120.00, 'DRAW', 28.00, 'SETTLED', now() - interval '1 days'
FROM users u, events e WHERE u.full_name = 'Lucas Bergström' AND e.team_a = 'Djokovic' AND e.team_b = 'Medvedev';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '1 days'
FROM bets b WHERE b.request_id = 'seed-req-0014';
 
-- BET 15: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0015', 'b000000000000000000000000000000000000000000000000000000000000015', 50.00, 'DRAW', 28.00, 'SETTLED', now() - interval '4 days'
FROM users u, events e WHERE u.full_name = 'Emma Johansson' AND e.team_a = 'Djokovic' AND e.team_b = 'Medvedev';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '4 days'
FROM bets b WHERE b.request_id = 'seed-req-0015';
 
-- BET 16: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0016', 'b000000000000000000000000000000000000000000000000000000000000016', 150.00, 'TEAM_B_WIN', 1.80, 'SETTLED', now() - interval '3 days'
FROM users u, events e WHERE u.full_name = 'Hugo Larsson' AND e.team_a = 'Zverev' AND e.team_b = 'Rublev';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 270.00, 'WON', now() - interval '3 days'
FROM bets b WHERE b.request_id = 'seed-req-0016';
 
-- BET 17: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0017', 'b000000000000000000000000000000000000000000000000000000000000017', 120.00, 'TEAM_A_WIN', 2.05, 'SETTLED', now() - interval '6 days'
FROM users u, events e WHERE u.full_name = 'Lucas Bergström' AND e.team_a = 'Zverev' AND e.team_b = 'Rublev';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '6 days'
FROM bets b WHERE b.request_id = 'seed-req-0017';
 
-- BET 18: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0018', 'b000000000000000000000000000000000000000000000000000000000000018', 75.00, 'TEAM_A_WIN', 2.05, 'SETTLED', now() - interval '5 days'
FROM users u, events e WHERE u.full_name = 'Yuki Nakatani' AND e.team_a = 'Zverev' AND e.team_b = 'Rublev';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '5 days'
FROM bets b WHERE b.request_id = 'seed-req-0018';
 
-- BET 19: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0019', 'b000000000000000000000000000000000000000000000000000000000000019', 200.00, 'TEAM_A_WIN', 1.95, 'SETTLED', now() - interval '3 days'
FROM users u, events e WHERE u.full_name = 'Yuki Nakatani' AND e.team_a = 'Astralis' AND e.team_b = 'Heroic';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 390.00, 'WON', now() - interval '3 days'
FROM bets b WHERE b.request_id = 'seed-req-0019';
 
-- BET 20: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0020', 'b000000000000000000000000000000000000000000000000000000000000020', 150.00, 'DRAW', 29.00, 'SETTLED', now() - interval '7 days'
FROM users u, events e WHERE u.full_name = 'Hugo Larsson' AND e.team_a = 'Astralis' AND e.team_b = 'Heroic';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '7 days'
FROM bets b WHERE b.request_id = 'seed-req-0020';
 
-- BET 21: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0021', 'b000000000000000000000000000000000000000000000000000000000000021', 150.00, 'DRAW', 3.10, 'SETTLED', now() - interval '4 days'
FROM users u, events e WHERE u.full_name = 'Emma Johansson' AND e.team_a = 'Färjestad' AND e.team_b = 'Frölunda';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 465.00, 'WON', now() - interval '4 days'
FROM bets b WHERE b.request_id = 'seed-req-0021';
 
-- BET 22: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0022', 'b000000000000000000000000000000000000000000000000000000000000022', 50.00, 'TEAM_B_WIN', 2.90, 'SETTLED', now() - interval '2 days'
FROM users u, events e WHERE u.full_name = 'David Chen' AND e.team_a = 'Färjestad' AND e.team_b = 'Frölunda';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '2 days'
FROM bets b WHERE b.request_id = 'seed-req-0022';
 
-- BET 23: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0023', 'b000000000000000000000000000000000000000000000000000000000000023', 300.00, 'TEAM_B_WIN', 2.75, 'SETTLED', now() - interval '2 days'
FROM users u, events e WHERE u.full_name = 'Emma Johansson' AND e.team_a = 'HV71' AND e.team_b = 'Rögle';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 825.00, 'WON', now() - interval '2 days'
FROM bets b WHERE b.request_id = 'seed-req-0023';
 
-- BET 24: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0024', 'b000000000000000000000000000000000000000000000000000000000000024', 75.00, 'DRAW', 3.05, 'SETTLED', now() - interval '2 days'
FROM users u, events e WHERE u.full_name = 'Hugo Larsson' AND e.team_a = 'HV71' AND e.team_b = 'Rögle';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '2 days'
FROM bets b WHERE b.request_id = 'seed-req-0024';
 
-- BET 25: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0025', 'b000000000000000000000000000000000000000000000000000000000000025', 200.00, 'DRAW', 3.05, 'SETTLED', now() - interval '5 days'
FROM users u, events e WHERE u.full_name = 'Sofia Nilsson' AND e.team_a = 'HV71' AND e.team_b = 'Rögle';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '5 days'
FROM bets b WHERE b.request_id = 'seed-req-0025';
 
-- BET 26: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0026', 'b000000000000000000000000000000000000000000000000000000000000026', 500.00, 'TEAM_A_WIN', 2.00, 'SETTLED', now() - interval '4 days'
FROM users u, events e WHERE u.full_name = 'Lucas Bergström' AND e.team_a = 'Aalborg' AND e.team_b = 'Kiel';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 1000.00, 'WON', now() - interval '4 days'
FROM bets b WHERE b.request_id = 'seed-req-0026';
 
-- BET 27: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0027', 'b000000000000000000000000000000000000000000000000000000000000027', 25.00, 'DRAW', 7.50, 'SETTLED', now() - interval '7 days'
FROM users u, events e WHERE u.full_name = 'Emma Johansson' AND e.team_a = 'Aalborg' AND e.team_b = 'Kiel';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '7 days'
FROM bets b WHERE b.request_id = 'seed-req-0027';
 
-- BET 28: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0028', 'b000000000000000000000000000000000000000000000000000000000000028', 75.00, 'DRAW', 7.50, 'SETTLED', now() - interval '6 days'
FROM users u, events e WHERE u.full_name = 'Yuki Nakatani' AND e.team_a = 'Aalborg' AND e.team_b = 'Kiel';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '6 days'
FROM bets b WHERE b.request_id = 'seed-req-0028';
 
-- BET 29: SETTLED / WON
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0029', 'b000000000000000000000000000000000000000000000000000000000000029', 200.00, 'TEAM_B_WIN', 1.78, 'SETTLED', now() - interval '4 days'
FROM users u, events e WHERE u.full_name = 'Sofia Nilsson' AND e.team_a = 'Flensburg' AND e.team_b = 'Magdeburg';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 356.00, 'WON', now() - interval '4 days'
FROM bets b WHERE b.request_id = 'seed-req-0029';
 
-- BET 30: SETTLED / LOST
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0030', 'b000000000000000000000000000000000000000000000000000000000000030', 500.00, 'DRAW', 7.80, 'SETTLED', now() - interval '3 days'
FROM users u, events e WHERE u.full_name = 'Taiga Davids' AND e.team_a = 'Flensburg' AND e.team_b = 'Magdeburg';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'LOST', now() - interval '3 days'
FROM bets b WHERE b.request_id = 'seed-req-0030';
 
-- BET 31: SETTLED / VOID
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0031', 'b000000000000000000000000000000000000000000000000000000000000031', 80.00, 'TEAM_A_WIN', 2.60, 'SETTLED', now() - interval '1 day'
FROM users u, events e WHERE u.full_name = 'Emma Johansson' AND e.team_a = 'PSG' AND e.team_b = 'Bayern';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 80.00, 'VOID', now() - interval '1 day'
FROM bets b WHERE b.request_id = 'seed-req-0031';
 
-- BET 32: SETTLED / VOID
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0032', 'b000000000000000000000000000000000000000000000000000000000000032', 120.00, 'TEAM_B_WIN', 2.50, 'SETTLED', now() - interval '1 day'
FROM users u, events e WHERE u.full_name = 'Hugo Larsson' AND e.team_a = 'PSG' AND e.team_b = 'Bayern';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 120.00, 'VOID', now() - interval '1 day'
FROM bets b WHERE b.request_id = 'seed-req-0032';
 
-- BET 33: CONSUMED / WAITING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0033', 'c000000000000000000000000000000000000000000000000000000000000033', 90.00, 'TEAM_B_WIN', 3.20, 'CONSUMED', now() - interval '11 minutes'
FROM users u, events e WHERE u.full_name = 'Taiga Davids' AND e.team_a = 'Arsenal' AND e.team_b = 'Chelsea';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'WAITING', now() - interval '11 minutes'
FROM bets b WHERE b.request_id = 'seed-req-0033';
 
-- BET 34: CONSUMED / WAITING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0034', 'c000000000000000000000000000000000000000000000000000000000000034', 50.00, 'DRAW', 15.00, 'CONSUMED', now() - interval '17 minutes'
FROM users u, events e WHERE u.full_name = 'Taiga Davids' AND e.team_a = 'Lakers' AND e.team_b = 'Celtics';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'WAITING', now() - interval '17 minutes'
FROM bets b WHERE b.request_id = 'seed-req-0034';
 
-- BET 35: CONSUMED / WAITING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0035', 'c000000000000000000000000000000000000000000000000000000000000035', 100.00, 'TEAM_A_WIN', 1.85, 'CONSUMED', now() - interval '11 minutes'
FROM users u, events e WHERE u.full_name = 'Oliver Andersson' AND e.team_a = 'Lakers' AND e.team_b = 'Celtics';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'WAITING', now() - interval '11 minutes'
FROM bets b WHERE b.request_id = 'seed-req-0035';
 
-- BET 36: CONSUMED / WAITING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0036', 'c000000000000000000000000000000000000000000000000000000000000036', 100.00, 'TEAM_A_WIN', 1.90, 'CONSUMED', now() - interval '12 minutes'
FROM users u, events e WHERE u.full_name = 'Maja Eriksson' AND e.team_a = 'NAVI' AND e.team_b = 'FaZe';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'WAITING', now() - interval '12 minutes'
FROM bets b WHERE b.request_id = 'seed-req-0036';
 
-- BET 37: CONSUMED / WAITING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0037', 'c000000000000000000000000000000000000000000000000000000000000037', 50.00, 'DRAW', 3.20, 'CONSUMED', now() - interval '20 minutes'
FROM users u, events e WHERE u.full_name = 'Yuki Nakatani' AND e.team_a = 'DIF' AND e.team_b = 'AIK';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'WAITING', now() - interval '20 minutes'
FROM bets b WHERE b.request_id = 'seed-req-0037';
 
-- BET 38: CONSUMED / WAITING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0038', 'c000000000000000000000000000000000000000000000000000000000000038', 75.00, 'DRAW', 17.00, 'CONSUMED', now() - interval '3 minutes'
FROM users u, events e WHERE u.full_name = 'Noah Karlsson' AND e.team_a = 'Clippers' AND e.team_b = 'Kings';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'WAITING', now() - interval '3 minutes'
FROM bets b WHERE b.request_id = 'seed-req-0038';
 
-- BET 39: CONSUMED / WAITING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0039', 'c000000000000000000000000000000000000000000000000000000000000039', 50.00, 'DRAW', 31.00, 'CONSUMED', now() - interval '4 minutes'
FROM users u, events e WHERE u.full_name = 'Lucas Bergström' AND e.team_a = 'Liquid' AND e.team_b = 'FURIA';
INSERT INTO settlements (bet_id, payout, state, created_at)
SELECT b.id, 0.00, 'WAITING', now() - interval '4 minutes'
FROM bets b WHERE b.request_id = 'seed-req-0039';
 
-- BET 40: PENDING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0040', 'c000000000000000000000000000000000000000000000000000000000000040', 30.00, 'TEAM_A_WIN', 2.30, 'PENDING', now() - interval '26 seconds'
FROM users u, events e WHERE u.full_name = 'Hugo Larsson' AND e.team_a = 'Warriors' AND e.team_b = 'Nuggets';
 
-- BET 41: PENDING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0041', 'c000000000000000000000000000000000000000000000000000000000000041', 30.00, 'TEAM_B_WIN', 2.10, 'PENDING', now() - interval '43 seconds'
FROM users u, events e WHERE u.full_name = 'Hugo Larsson' AND e.team_a = 'Barcelona HB' AND e.team_b = 'PSG HB';
 
-- BET 42: PENDING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0042', 'c000000000000000000000000000000000000000000000000000000000000042', 50.00, 'TEAM_B_WIN', 2.45, 'PENDING', now() - interval '37 seconds'
FROM users u, events e WHERE u.full_name = 'Maja Eriksson' AND e.team_a = 'Liverpool' AND e.team_b = 'Man City';
 
-- BET 43: PENDING
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0043', 'c000000000000000000000000000000000000000000000000000000000000043', 30.00, 'TEAM_B_WIN', 1.80, 'PENDING', now() - interval '49 seconds'
FROM users u, events e WHERE u.full_name = 'Maja Eriksson' AND e.team_a = 'G2' AND e.team_b = 'Cloud9';
 
-- BET 44: EXPIRED
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0044', 'c000000000000000000000000000000000000000000000000000000000000044', 40.00, 'TEAM_A_WIN', 2.10, 'EXPIRED', now() - interval '39 minutes'
FROM users u, events e WHERE u.full_name = 'Taiga Davids' AND e.team_a = 'Arsenal' AND e.team_b = 'Chelsea';
 
-- BET 45: EXPIRED
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0045', 'c000000000000000000000000000000000000000000000000000000000000045', 40.00, 'TEAM_A_WIN', 2.25, 'EXPIRED', now() - interval '72 minutes'
FROM users u, events e WHERE u.full_name = 'Lucas Bergström' AND e.team_a = 'Clippers' AND e.team_b = 'Kings';
 
-- BET 46: EXPIRED
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0046', 'c000000000000000000000000000000000000000000000000000000000000046', 25.00, 'TEAM_A_WIN', 2.35, 'EXPIRED', now() - interval '80 minutes'
FROM users u, events e WHERE u.full_name = 'Emma Johansson' AND e.team_a = 'Inter' AND e.team_b = 'Juventus';
 
-- BET 47: EXPIRED
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0047', 'c000000000000000000000000000000000000000000000000000000000000047', 25.00, 'TEAM_A_WIN', 1.85, 'EXPIRED', now() - interval '37 minutes'
FROM users u, events e WHERE u.full_name = 'David Chen' AND e.team_a = 'Lakers' AND e.team_b = 'Celtics';
 
-- BET 48: EXPIRED
INSERT INTO bets (user_id, event_id, request_id, checksum, stake, selection, odds, state, created_at)
SELECT u.id, e.id, 'seed-req-0048', 'c000000000000000000000000000000000000000000000000000000000000048', 40.00, 'TEAM_A_WIN', 1.90, 'EXPIRED', now() - interval '52 minutes'
FROM users u, events e WHERE u.full_name = 'Lucas Bergström' AND e.team_a = 'NAVI' AND e.team_b = 'FaZe';