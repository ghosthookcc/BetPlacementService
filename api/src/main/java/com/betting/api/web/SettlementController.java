package com.betting.api.web;

import dto.Response;

import com.betting.api.service.SettlementService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/settlements")
public class SettlementController
{
    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService)
    {
        this.settlementService = settlementService;
    }

    @GetMapping
    public List<Response.Settlement> latest(@RequestParam(required = false) Long userId,
                                            @RequestParam(required = false, defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int limit)
    {
        int capped = Math.max(1, Math.min(limit, 100));
        return settlementService.latest(userId, capped);
    }
}
