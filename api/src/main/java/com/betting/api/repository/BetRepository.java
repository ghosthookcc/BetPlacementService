package com.betting.api.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BetRepository extends JpaRepository<entity.Bet, Long>
{
    Optional<entity.Bet> findByRequestId(String requestId);
    List<entity.Bet> findAllByOrderByCreatedAtDescIdDesc(Pageable pageable);

    List<entity.Bet> findByUserIdOrderByCreatedAtDescIdDesc(Long userId, Pageable pageable);

    @Query("SELECT b.id FROM Bet b WHERE b.userId = :userId")
    List<Long> findIdsByUserId(Long userId);
}