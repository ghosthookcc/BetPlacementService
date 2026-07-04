package com.betting.api.service;

import com.betting.api.types.*;

import com.betting.api.repository.CategoryRepository;
import com.betting.api.repository.EventRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventService {

    private final EventRepository events;
    private final CategoryRepository categories;

    public EventService(EventRepository events, CategoryRepository categories) {
        this.events = events;
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public List<dto.Event> bettableEventsForCategory(Long categoryId)
    {
        if (!categories.existsById(categoryId)) throw ApiException.notFound("No category with id " + categoryId);

        return events.findByCategoryIdAndStateOrderByStartsAtAsc(categoryId, EventState.UPCOMING)
                     .stream()
                     .map(dto.Event::from)
                     .toList();
    }
}
