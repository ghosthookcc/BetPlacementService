package com.betting.api.web;

import dto.Response;

import com.betting.api.service.CategoryService;
import com.betting.api.service.EventService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController
{
    private final CategoryService categoryService;
    private final EventService eventService;

    public CategoryController(CategoryService categoryService, EventService eventService)
    {
        this.categoryService = categoryService;
        this.eventService = eventService;
    }

    @GetMapping
    public List<Response.Category> categories()
    {
        return categoryService.listAll();
    }

    @GetMapping("/{id}/events")
    public List<dto.Event> events(@PathVariable Long id) {
        return eventService.bettableEventsForCategory(id);
    }
}
