package com.betting.api.repository;

import com.betting.api.types.EventState;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<entity.Event, UUID>
{
    List<entity.Event> findByCategoryIdAndStateOrderByStartsAtAsc(Long categoryId, EventState state);
    List<entity.Event> findByStateInOrderByStartsAtAsc(List<EventState> states);
    List<entity.Event> findAllByOrderByStartsAtAsc();
    List<entity.Event> findByIdIn(List<UUID> ids);
}
