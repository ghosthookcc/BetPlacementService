package com.betting.api.repository;

import com.betting.api.types.BetState;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BetRepository extends JpaRepository<entity.Bet, Long>
{
    Optional<entity.Bet> findByRequestId(String requestId);
    List<entity.Bet> findAllByOrderByCreatedAtDescIdDesc(Pageable pageable);

    List<entity.Bet> findByUserIdOrderByCreatedAtDescIdDesc(Long userId, Pageable pageable);

    Optional<entity.Bet> findByChecksum(String checksum);

    List<entity.Bet> findByEventIdAndState(UUID eventId, BetState state);

    List<entity.Bet> findByStateAndCreatedAtBefore(BetState state, OffsetDateTime cutoff);

    @Query("SELECT b.id FROM Bet b WHERE b.userId = :userId")
    List<Long> findIdsByUserId(Long userId);

}