package dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record Event(
        UUID id,
        Long categoryId,
        String teamA,
        String teamB,
        BigDecimal oddsTeamA,
        BigDecimal oddsDraw,
        BigDecimal oddsTeamB,
        String state,
        OffsetDateTime startsAt
)
{
    public static Event from(entity.Event event)
    {
        return new Event(event.getId(),
                         event.getCategoryId(),
                         event.getTeamA(),
                         event.getTeamB(),
                         event.getOddsTeamA(),
                         event.getOddsDraw(),
                         event.getOddsTeamB(),
                         event.getState().toString(),
                         event.getStartsAt());
    }
}