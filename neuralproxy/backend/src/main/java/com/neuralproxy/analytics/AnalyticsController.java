package com.neuralproxy.analytics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/requests")
    public ResponseEntity<List<RequestLog>> getRecentRequests(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(analyticsService.getRecentRequests(limit));
    }

    @GetMapping("/cost-over-time")
    public ResponseEntity<List<Map<String, Object>>> getCostOverTime() {
        return ResponseEntity.ok(analyticsService.getCostOverTime());
    }

    @GetMapping("/latency-by-provider")
    public ResponseEntity<Map<String, Object>> getLatencyByProvider() {
        return ResponseEntity.ok(analyticsService.getLatencyByProvider());
    }
}
