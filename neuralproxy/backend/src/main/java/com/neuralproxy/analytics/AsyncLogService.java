package com.neuralproxy.analytics;

import com.neuralproxy.model.PromptResponse;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
public class AsyncLogService {

    private final RequestLogRepository requestLogRepository;
    private final WebSocketPublisher webSocketPublisher;

    public AsyncLogService(RequestLogRepository requestLogRepository,
                           WebSocketPublisher webSocketPublisher) {
        this.requestLogRepository = requestLogRepository;
        this.webSocketPublisher = webSocketPublisher;
    }

    @Async
    public void logAndPublish(PromptResponse response, UUID tenantId, String prompt) {
        try {
            RequestLog log = RequestLog.builder()
                .tenantId(tenantId)
                .prompt(prompt)
                .provider(response.getProvider())
                .latencyMs(response.getLatencyMs())
                .tokenCount(response.getTokenCount())
                .costUsd(response.getCostUsd())
                .cacheHit(response.isCacheHit())
                .build();
            requestLogRepository.save(log);

            long total = requestLogRepository.countAll();
            long cacheHits = requestLogRepository.countCacheHits();
            double hitRate = total > 0 ? (double) cacheHits / total * 100 : 0;
            Double avgLatency = requestLogRepository.avgLatency();
            Double totalCost = requestLogRepository.totalCost();

            WebSocketPublisher.RecentRequest recent = new WebSocketPublisher.RecentRequest(
                response.getProvider(),
                response.getLatencyMs(),
                response.isCacheHit(),
                response.getCostUsd()
            );

            WebSocketPublisher.AnalyticsEvent event = new WebSocketPublisher.AnalyticsEvent(
                total,
                BigDecimal.valueOf(hitRate).setScale(1, RoundingMode.HALF_UP).doubleValue(),
                avgLatency != null ? Math.round(avgLatency) : 0L,
                totalCost != null ? BigDecimal.valueOf(totalCost).setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO,
                recent
            );

            webSocketPublisher.publishAnalytics(event);
        } catch (Exception e) {
            // Non-critical — log and continue
        }
    }
}
