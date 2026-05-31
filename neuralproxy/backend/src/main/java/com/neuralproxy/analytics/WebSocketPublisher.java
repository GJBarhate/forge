package com.neuralproxy.analytics;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class WebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WebSocketPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public record RecentRequest(String provider, long latency, boolean cacheHit, BigDecimal cost) {}

    public record AnalyticsEvent(
        long totalRequests,
        double cacheHitRate,
        long avgLatency,
        BigDecimal totalCost,
        RecentRequest recentRequest
    ) {}

    public void publishAnalytics(AnalyticsEvent event) {
        try {
            messagingTemplate.convertAndSend("/topic/analytics", event);
        } catch (Exception e) {
            // Non-critical
        }
    }
}
