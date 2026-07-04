package entity;

import com.betting.api.types.BetState;
import com.betting.api.types.Selection;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bets")
public class Bet
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "request_id", nullable = false, unique = true)
    private String requestId;

    @Column(nullable = false, unique = true, length = 64)
    private String checksum;

    @Column(nullable = false)
    private BigDecimal stake;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Selection selection;

    @Column(nullable = false)
    private BigDecimal odds;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BetState state;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public static Bet placed(Long userId, UUID eventId, String requestId, String checksum,
                             BigDecimal stake, Selection selection, BigDecimal odds)
    {
        Bet b = new Bet();
        b.userId = userId;
        b.eventId = eventId;
        b.requestId = requestId;
        b.checksum = checksum;
        b.stake = stake;
        b.selection = selection;
        b.odds = odds;
        b.state = BetState.CREATED;
        return b;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() { return userId; }

    public UUID getEventId() { return eventId; }

    public String getRequestId() {
        return requestId;
    }

    public String getChecksum() {
        return checksum;
    }

    public BigDecimal getStake() {
        return stake;
    }

    public Selection getSelection() {
        return selection;
    }

    public BigDecimal getOdds() {
        return odds;
    }

    public BetState getState() {
        return state;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
