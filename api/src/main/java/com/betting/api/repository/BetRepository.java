package com.betting.api.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BetRepository extends JpaRepository<entity.Bet, Long>
{
    Optional<entity.Bet> findByRequestId(String requestId);
    List<entity.Bet> findAllByOrderByCreatedAtDescIdDesc(Pageable pageable);
}