package com.betting.api.service;

import com.betting.api.types.EventState;
import com.betting.api.types.Selection;

import com.betting.api.repository.BetRepository;
import com.betting.api.repository.EventRepository;
import com.betting.api.repository.UserAccountRepository;

import dto.Request;
import dto.Response;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class BetService {

    private final BetRepository bets;
    private final EventRepository events;
    private final UserAccountRepository users;

    public BetService(BetRepository bets, EventRepository events, UserAccountRepository users) {
        this.bets = bets;
        this.events = events;
        this.users = users;
    }

    @Transactional
    public Response.PlacedBet place(Request.PlaceBet request)
    {
        Optional<entity.Bet> existing = bets.findByRequestId(request.requestId());
        if (existing.isPresent()) return Response.PlacedBet.from(existing.get());

        final Selection selection;
        try
        {
            selection = Selection.valueOf(request.selection());
        }
        catch (IllegalArgumentException errno)
        {
            throw ApiException.badRequest("Invalid selection: " + request.selection());
        }

        if (!users.existsById(request.userId())) throw ApiException.notFound("No user with id " + request.userId());

        entity.Event event = events.findById(request.eventId())
                                   .orElseThrow(() -> ApiException.notFound("No event with id " + request.eventId()));
        if (event.getState() != EventState.UPCOMING)
        {
            throw ApiException.badRequest("Event " + event.getId() + " is not open for betting");
        }

        BigDecimal lockedOdds = event.oddsFor(selection);

        String checksum = ChecksumGenerator.next();
        entity.Bet bet = entity.Bet.placed(request.userId(),
                                           event.getId(),
                                           request.requestId(), checksum,
                                           request.stake(), selection, lockedOdds);

        try
        {
            entity.Bet saved = bets.save(bet);
            return Response.PlacedBet.from(saved);
        }
        catch (DataIntegrityViolationException errno)
        {
            return bets.findByRequestId(request.requestId())
                       .map(Response.PlacedBet::from)
                       .orElseThrow(() -> ApiException.conflict("Could not place bet"));
        }
    }

    @Transactional(readOnly = true)
    public List<Response.BetSummary> latest(int limit)
    {
        Pageable page = PageRequest.of(0, limit);
        List<entity.Bet> rows = bets.findAllByOrderByCreatedAtDescIdDesc(page);
        return Response.BetSummary.summaryFromRows(rows,
                                                   users, events);
    }

    @Transactional(readOnly=true)
    public List<Response.BetSummary> allNewestFirst(int page, int size)
    {
        return allNewestFirst(null, page, size);
    }

    @Transactional(readOnly = true)
    public List<Response.BetSummary> allNewestFirst(Long userId, int page, int size)
    {
        List<entity.Bet> rows;
        if (userId == null) {
            Pageable pageable = PageRequest.of(page, size,
                    org.springframework.data.domain.Sort.by("createdAt", "id").descending());
            rows = bets.findAll(pageable).getContent();
        }
        else
        {
            Pageable pageable = PageRequest.of(page, size);
            rows = bets.findByUserIdOrderByCreatedAtDescIdDesc(userId, pageable);
        }

        return Response.BetSummary.summaryFromRows(rows,
                                                   users, events);
    }


}
