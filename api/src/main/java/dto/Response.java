package dto;

import com.betting.api.repository.EventRepository;
import com.betting.api.repository.UserAccountRepository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class Response extends Dto
{
    public record BetSummary(
            Long id,
            String userFullName,
            String teamA,
            String teamB,
            String selection,
            BigDecimal stake,
            BigDecimal odds,
            String state,
            OffsetDateTime placedAt
    )
    {
        public static List<BetSummary> summaryFromRows(List<entity.Bet> rows,
                                                       UserAccountRepository users, EventRepository events)
        {
            if (rows.isEmpty()) return List.of();

            List<Long> userIds = rows.stream().map(entity.Bet::getUserId).distinct().toList();
            List<UUID> eventIds = rows.stream().map(entity.Bet::getEventId).distinct().toList();

            Map<Long, entity.UserAccount> userById = users.findByIdIn(userIds).stream()
                                                          .collect(Collectors.toMap(entity.UserAccount::getId, Function.identity()));
            Map<UUID, entity.Event> eventById = events.findByIdIn(eventIds).stream()
                                                      .collect(Collectors.toMap(entity.Event::getId, Function.identity()));

            return rows.stream().map(bet ->
            {
                entity.UserAccount user = userById.get(bet.getUserId());
                entity.Event event = eventById.get(bet.getEventId());
                return new BetSummary(bet.getId(),
                                      user != null ? user.getFullName() : null,
                                      event != null ? event.getTeamA() : null,
                                      event != null ? event.getTeamB() : null,
                                      bet.getSelection().name(),
                                      bet.getStake(),
                                      bet.getOdds(),
                                      bet.getState().name(),
                                      bet.getCreatedAt());
            }).toList();
        }
    }

    public record Category(
            Long id,
            String name,
            String glyph
    )
    {
        public static Category from(entity.Category category)
        {
            return new Category(category.getId(),
                                category.getName(),
                                category.getGlyph());
        }
    }

    public record PlacedBet(
            Long id,
            Long userId,
            String checksum,
            BigDecimal stake,
            String selection,
            BigDecimal odds,
            String state,
            OffsetDateTime placedAt
    )
    {
        public static PlacedBet from(entity.Bet bet)
        {
            return new PlacedBet(
                    bet.getId(),
                    bet.getUserId(),
                    bet.getChecksum(),
                    bet.getStake(),
                    bet.getSelection().toString(),
                    bet.getOdds(),
                    bet.getState().toString(),
                    bet.getCreatedAt()
            );
        }
    }

    public record Settlement(
            Long id,
            Long betId,
            String userFullName,
            String teamA,
            String teamB,
            String selection,
            BigDecimal payout,
            String state,
            OffsetDateTime settledAt
    ) {}

    public record User(Long id,
                       String fullName
    ) {}
}