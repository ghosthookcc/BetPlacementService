package com.betting.api.web;

import dto.Event;
import dto.Request;
import dto.Response;

import com.betting.api.service.EventService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<dto.Event> allEvents(@RequestParam(required = false, defaultValue="false") boolean actionable)
    {
        return actionable ? eventService.actionableEvents() : eventService.allEvents();
    }

    @PostMapping("/{id}/state")
    public Response.EventState setState(@PathVariable UUID id,
                                        @Valid @RequestBody Request.EventState request)
    {
        return eventService.transition(id, request.target(), request.result());
    }
}