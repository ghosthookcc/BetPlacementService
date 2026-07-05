package entity;

import com.betting.api.types.EventState;
import com.betting.api.types.Selection;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event
{
    @Id
    private UUID id;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "team_a", nullable = false)
    private String teamA;

    @Column(name = "team_b", nullable = false)
    private String teamB;

    @Column(name = "odds_team_a", nullable = false)
    private BigDecimal oddsTeamA;

    @Column(name = "odds_draw", nullable = false)
    private BigDecimal oddsDraw;

    @Column(name = "odds_team_b", nullable = false)
    private BigDecimal oddsTeamB;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventState state;

    @Column(name = "starts_at")
    private OffsetDateTime startsAt;

    protected Event() { }

    public UUID getId() {
        return id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getTeamA() {
        return teamA;
    }

    public String getTeamB() {
        return teamB;
    }

    public BigDecimal getOddsTeamA() {
        return oddsTeamA;
    }

    public BigDecimal getOddsDraw() {
        return oddsDraw;
    }

    public BigDecimal getOddsTeamB() {
        return oddsTeamB;
    }

    public EventState getState() {
        return state;
    }

    public void setState(EventState state) { this.state = state;}

    public OffsetDateTime getStartsAt() {
        return startsAt;
    }

    public BigDecimal oddsFor(Selection selection)
    {
        return switch (selection)
        {
            case TEAM_A_WIN -> oddsTeamA;
            case TEAM_B_WIN -> oddsTeamB;
            case DRAW -> oddsDraw;
        };
    }
}
