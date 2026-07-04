package entity;

import com.betting.api.types.SettlementState;
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

@Entity
@Table(name = "settlements")
public class Settlement
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bet_id", nullable = false, unique = true)
    private Long betId;

    @Column(nullable = false)
    private BigDecimal payout;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettlementState state;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Settlement() { }

    public Long getId() { return id; }

    public Long getBetId() { return betId; }

    public BigDecimal getPayout() { return payout; }

    public SettlementState getState() { return state; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
}
