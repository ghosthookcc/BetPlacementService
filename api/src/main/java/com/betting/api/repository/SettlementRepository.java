package com.betting.api.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementRepository extends JpaRepository<entity.Settlement, Long>
{
    List<entity.Settlement> findAllByOrderByCreatedAtDescIdDesc(Pageable pageable);
    List<entity.Settlement> findByBetIdInOrderByCreatedAtDescIdDesc(List<Long> betIds, Pageable pageable);
}
