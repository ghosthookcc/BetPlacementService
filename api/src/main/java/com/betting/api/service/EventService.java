package com.betting.api.service;

import com.betting.api.types.*;

import dto.Response;

import com.betting.api.repository.EventRepository;
import com.betting.api.repository.CategoryRepository;
import com.betting.api.repository.BetRepository;
import com.betting.api.repository.SettlementRepository;

import entity.Event;
import entity.Settlement;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class EventService
{
    private final EventRepository events;
    private final CategoryRepository categories;
    private final BetRepository bets;
    private final SettlementRepository settlements;

    public EventService(EventRepository events, CategoryRepository categories, BetRepository bets, SettlementRepository settlements)
    {
        this.events = events;
        this.categories = categories;
        this.bets = bets;
        this.settlements = settlements;
    }

    @Transactional(readOnly = true)
    public List<dto.Event> bettableEventsForCategory(Long categoryId)
    {
        if (!categories.existsById(categoryId)) throw ApiException.notFound("No category with id " + categoryId);

        return events.findByCategoryIdAndStateOrderByStartsAtAsc(categoryId, EventState.UPCOMING)
                     .stream()
                     .map(dto.Event::from)
                     .toList();
    }

    public List<dto.Event> actionableEvents()
    {
        return events.findByStateInOrderByStartsAtAsc(List.of(EventState.UPCOMING, EventState.LIVE))
                     .stream()
                     .map(dto.Event::from)
                     .toList();
    }

    @Transactional(readOnly = true)
    public List<dto.Event> allEvents()
    {
        return events.findAllByOrderByStartsAtAsc()
                .stream()
                .map(dto.Event::from)
                .toList();
    }

    @Transactional
    public Response.EventState transition(UUID eventId, String targetRaw, String resultRaw)
    {
        entity.Event event = events.findById(eventId)
                                   .orElseThrow(() -> ApiException.notFound("No event with id " + eventId));

        final EventState target = parseEventState(targetRaw);
        final EventState from = event.getState();

        if (!isLegalTransition(from, target))
        {
            throw ApiException.badRequest("Illegal transition " + from + " -> " + target);
        }

        Selection result = null;
        if (target == EventState.FINISHED)
        {
            if (resultRaw == null || resultRaw.isBlank())
            {
                throw ApiException.badRequest("A result is required to finish an event");
            }
            result = parseSelection(resultRaw);
        }

        int settled = 0;
        int voided = 0;
        int expired = 0;

        List<entity.Bet> pending = bets.findByEventIdAndState(eventId, BetState.PENDING);
        for (entity.Bet bet : pending)
        {
            bet.markExpired();
            expired++;
        }

        if (target == EventState.FINISHED || target == EventState.CANCELLED)
        {
            List<entity.Bet> consumed = bets.findByEventIdAndState(eventId, BetState.CONSUMED);
            for (entity.Bet bet : consumed)
            {
                entity.Settlement settlement = settlements.findByBetId(bet.getId())
                                                          .orElseGet(() -> settlements.save(Settlement.waitingFor(bet.getId())));
                if (target == EventState.CANCELLED)
                {
                    settlement.resolve(SettlementState.VOID, bet.getStake());
                    voided++;
                }
                else
                {
                    boolean won = bet.getSelection() == result;
                    if (won)
                    {
                        BigDecimal payout = bet.getStake().multiply(bet.getOdds());
                        settlement.resolve(SettlementState.WON, payout);
                    }
                    else
                    {
                        settlement.resolve(SettlementState.LOST, BigDecimal.ZERO);
                    }
                    settled++;
                }
                bet.markSettled();
            }
        }
        event.setState(target);
        return new Response.EventState(event.getId().toString(), target.toString(), settled, voided, expired);
    }

    private boolean isLegalTransition(EventState from, EventState to)
    {
        return switch (from)
        {
            case UPCOMING -> to == EventState.LIVE
                          || to == EventState.FINISHED
                          || to == EventState.CANCELLED;
            case LIVE -> to == EventState.FINISHED
                      || to == EventState.CANCELLED;
            case FINISHED, CANCELLED -> false;
        };
    }

    private EventState parseEventState(String raw)
    {
        try
        {
            return EventState.valueOf(raw);
        }
        catch (IllegalArgumentException | NullPointerException errno)
        {
            throw ApiException.badRequest("Invalid target state: " + raw);
        }
    }

    private Selection parseSelection(String raw)
    {
        try
        {
            return Selection.valueOf(raw);
        }
        catch (IllegalArgumentException errno)
        {
            throw ApiException.badRequest("Invalid selection state " + raw);
        }
    }
}
