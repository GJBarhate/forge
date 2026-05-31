package com.neuralproxy.analytics;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final RequestLogRepository requestLogRepository;

    public AnalyticsService(RequestLogRepository requestLogRepository) {
        this.requestLogRepository = requestLogRepository;
    }

    public Map<String, Object> getSummary() {
        long total = requestLogRepository.countAll();
        long cacheHits = requestLogRepository.countCacheHits();
        Double avgLatency = requestLogRepository.avgLatency();
        Double totalCost = requestLogRepository.totalCost();

        double cacheHitRate = total > 0 ? (double) cacheHits / total * 100 : 0;

        return Map.of(
            "totalRequests", total,
            "cacheHitRate", BigDecimal.valueOf(cacheHitRate).setScale(1, RoundingMode.HALF_UP),
            "avgLatency", avgLatency != null ? Math.round(avgLatency) : 0,
            "totalCost", totalCost != null ? BigDecimal.valueOf(totalCost).setScale(4, RoundingMode.HALF_UP) : 0
        );
    }

    public List<RequestLog> getRecentRequests(int limit) {
        return requestLogRepository.findRecentRequests(PageRequest.of(0, limit));
    }

    public List<Map<String, Object>> getCostOverTime() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<RequestLog> logs = requestLogRepository.findSince(since);

        Map<String, Map<String, Double>> hourlyData = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:00");

        for (RequestLog log : logs) {
            String hour = log.getCreatedAt().format(fmt);
            hourlyData.computeIfAbsent(hour, k -> new HashMap<>());
            String provider = log.getProvider() != null ? log.getProvider() : "UNKNOWN";
            double cost = log.getCostUsd() != null ? log.getCostUsd().doubleValue() : 0;
            hourlyData.get(hour).merge(provider, cost, Double::sum);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, Double>> entry : hourlyData.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("timestamp", entry.getKey());
            point.put("gemini", entry.getValue().getOrDefault("GEMINI", 0.0));
            point.put("openai", entry.getValue().getOrDefault("OPENAI", 0.0));
            result.add(point);
        }
        return result;
    }

    public Map<String, Object> getLatencyByProvider() {
        List<RequestLog> logs = requestLogRepository.findRecentRequests(PageRequest.of(0, 1000));

        Map<String, List<Long>> byProvider = new HashMap<>();
        for (RequestLog log : logs) {
            if (log.getProvider() != null && log.getLatencyMs() != null) {
                byProvider.computeIfAbsent(log.getProvider(), k -> new ArrayList<>()).add(log.getLatencyMs());
            }
        }

        Map<String, Object> result = new HashMap<>();
        for (Map.Entry<String, List<Long>> entry : byProvider.entrySet()) {
            List<Long> latencies = entry.getValue().stream().sorted().collect(Collectors.toList());
            int size = latencies.size();
            long p50 = size > 0 ? latencies.get(size / 2) : 0;
            long p99 = size > 0 ? latencies.get((int) (size * 0.99)) : 0;
            result.put(entry.getKey(), Map.of("p50", p50, "p99", p99));
        }
        return result;
    }
}
