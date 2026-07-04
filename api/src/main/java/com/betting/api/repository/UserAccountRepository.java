package com.betting.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserAccountRepository extends JpaRepository<entity.UserAccount, Long>
{
    List<entity.UserAccount> findByIdIn(List<Long> ids);
}