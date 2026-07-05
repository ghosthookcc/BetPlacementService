package com.betting.api.service;

import dto.Response;

import com.betting.api.repository.UserAccountRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserAccountRepository users;

    public UserService(UserAccountRepository users)
    {
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<Response.User> listAll()
    {
        return users.findAll().stream()
                              .map(user -> new Response.User(user.getId(), user.getFullName()))
                              .toList();
    }
}
