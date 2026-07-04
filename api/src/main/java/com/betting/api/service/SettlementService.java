package com.betting.api.service;

import dto.Response;

import com.betting.api.repository.BetRepository;
import com.betting.api.repository.EventRepository;
import com.betting.api.repository.SettlementRepository;
import com.betting.api.repository.UserAccountRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SettlementService
{
    private final SettlementRepository settlements;
    private final BetRepository bets;
    private final UserAccountRepository users;
    private final EventRepository events;

    public SettlementService(SettlementRepository settlements, BetRepository bets,
                             UserAccountRepository users, EventRepository events)
    {
        this.settlements = settlements;
        this.bets = bets;
        this.users = users;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<Response.Settlement> latest(int limit)
    {
        Pageable page = PageRequest.of(0, limit);
        List<entity.Settlement> rows = settlements.findAllByOrderByCreatedAtDescIdDesc(page);
        if (rows.isEmpty()) return List.of();

        List<Long> betIds = rows.stream().map(entity.Settlement::getBetId).distinct().toList();
        Map<Long, entity.Bet> betById = bets.findAllById(betIds).stream()
                                     .collect(Collectors.toMap(entity.Bet::getId, Function.identity()));

        List<Long> userIds = betById.values().stream().map(entity.Bet::getUserId).distinct().toList();
        List<UUID> eventIds = betById.values().stream().map(entity.Bet::getEventId).distinct().toList();

        Map<Long, entity.UserAccount> userById = users.findByIdIn(userIds).stream()
                                                      .collect(Collectors.toMap(entity.UserAccount::getId, Function.identity()));
        Map<UUID, entity.Event> eventById = events.findByIdIn(eventIds).stream()
                                                  .collect(Collectors.toMap(entity.Event::getId, Function.identity()));

        return rows.stream().map(settlement ->
        {
            entity.Bet bet = betById.get(settlement.getBetId());
            entity.UserAccount user = bet != null ? userById.get(bet.getUserId()) : null;
            entity.Event event = bet != null ? eventById.get(bet.getEventId()) : null;
            return new Response.Settlement(settlement.getId(),
                                           settlement.getBetId(),
                                           user != null ? user.getFullName() : null,
                                           event != null ? event.getTeamA() : null,
                                           event != null ? event.getTeamB() : null,
                                           bet != null ? bet.getSelection().name() : null,
                                           settlement.getPayout(),
                                           settlement.getState().name(),
                                           settlement.getCreatedAt());
        }).toList();
    }
}
