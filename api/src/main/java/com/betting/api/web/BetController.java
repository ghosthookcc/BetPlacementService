package com.betting.api.web;

import dto.Request;
import dto.Response;

import com.betting.api.service.BetService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bets")
public class BetController {

    private final BetService betService;

    public BetController(BetService betService) {
        this.betService = betService;
    }

    @GetMapping("/latest")
    public List<Response.BetSummary> latest(@RequestParam(defaultValue = "20") int limit)
    {
        int capped = Math.max(1, Math.min(limit, 100));
        return betService.latest(capped);
    }

    @GetMapping
    public List<Response.BetSummary> all(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "50") int size)
    {
        int cappedSize = Math.max(1, Math.min(size, 200));
        int safePage = Math.max(0, page);
        return betService.allNewestFirst(safePage, cappedSize);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Response.PlacedBet place(@Valid @RequestBody Request.PlaceBet request) {
        return betService.place(request);
    }
}
