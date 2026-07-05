package com.betting.api.service;

import com.betting.api.repository.BetRepository;
import com.betting.api.types.BetState;
import entity.Bet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;


@Service
public class ReaperService
{
    private static final Logger log = LoggerFactory.getLogger(ReaperService.class);

    private static final long TIMEOUT_MINUTES = 5;

    private static final long RUN_EVERY_MS = 60_000;

    private final BetRepository bets;

    public ReaperService(BetRepository bets)
    {
        this.bets = bets;
    }

    @Scheduled(fixedDelay = RUN_EVERY_MS)
    @Transactional
    public void reapStaleBets()
    {
        OffsetDateTime cutoff = OffsetDateTime.now().minusMinutes(TIMEOUT_MINUTES);
        List<Bet> stale = bets.findByStateAndCreatedAtBefore(BetState.PENDING, cutoff);
        if (stale.isEmpty()) return;

        for (Bet bet : stale) bet.markExpired();

        bets.saveAllAndFlush(stale);
        bets.deleteAll(stale);

        log.info("Reaper expired and deleted {} stale bet(s)", stale.size());
    }
}
