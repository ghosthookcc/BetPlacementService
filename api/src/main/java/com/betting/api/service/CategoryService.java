package com.betting.api.service;

import com.betting.api.repository.CategoryRepository;

import dto.Response;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService
{
    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories)
    {
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public List<Response.Category> listAll()
    {
        return categories.findAllByOrderByNameAsc().stream()
                                                   .map(Response.Category::from)
                                                   .toList();
    }
}
