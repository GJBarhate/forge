package com.neuralproxy.gateway;

import com.neuralproxy.analytics.AsyncLogService;
import com.neuralproxy.cache.RedisCacheService;
import com.neuralproxy.cache.SemanticCacheService;
import com.neuralproxy.model.PromptRequest;
import com.neuralproxy.model.PromptResponse;
import com.neuralproxy.ratelimit.RateLimitService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Service
public class GatewayService {

    private final SemanticCacheService semanticCacheService;
    private final RedisCacheService redisCacheService;
    private final ProviderRouter providerRouter;
    private final RateLimitService rateLimitService;
    private final AsyncLogService asyncLogService;

    public GatewayService(SemanticCacheService semanticCacheService,
                          RedisCacheService redisCacheService,
                          ProviderRouter providerRouter,
                          RateLimitService rateLimitService,
                          AsyncLogService asyncLogService) {
        this.semanticCacheService = semanticCacheService;
        this.redisCacheService = redisCacheService;
        this.providerRouter = providerRouter;
        this.rateLimitService = rateLimitService;
        this.asyncLogService = asyncLogService;
    }

    public PromptResponse process(PromptRequest req, UUID tenantId) {
        // 1. Rate limiting
        if (!rateLimitService.canConsume(tenantId.toString())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded");
        }

        String prompt = req.getPrompt();

        // 2. Exact match Redis cache
        Optional<String> redisHit = redisCacheService.get(prompt, tenantId.toString());
        if (redisHit.isPresent()) {
            PromptResponse response = PromptResponse.builder()
                .text(redisHit.get())
                .provider("CACHE")
                .latencyMs(0L)
                .tokenCount(0)
                .costUsd(BigDecimal.ZERO)
                .cacheHit(true)
                .build();
            asyncLogService.logAndPublish(response, tenantId, prompt);
            return response;
        }

        // 3. Semantic cache
        Optional<String> semanticHit = semanticCacheService.findSimilar(prompt, tenantId);
        if (semanticHit.isPresent()) {
            PromptResponse response = PromptResponse.builder()
                .text(semanticHit.get())
                .provider("CACHE")
                .latencyMs(5L)
                .tokenCount(0)
                .costUsd(BigDecimal.ZERO)
                .cacheHit(true)
                .build();
            asyncLogService.logAndPublish(response, tenantId, prompt);
            return response;
        }

        // 4. Call provider
        ProviderRouter.ProviderResponse providerResponse = providerRouter.route(prompt, req.getProvider());

        PromptResponse response = PromptResponse.builder()
            .text(providerResponse.text())
            .provider(providerResponse.provider())
            .latencyMs(providerResponse.latencyMs())
            .tokenCount(providerResponse.tokenCount())
            .costUsd(providerResponse.costUsd())
            .cacheHit(false)
            .build();

        // 5. Save to caches (non-blocking)
        semanticCacheService.save(prompt, providerResponse.text(), tenantId);
        redisCacheService.set(prompt, tenantId.toString(), providerResponse.text(), Duration.ofHours(1));

        // 6. Async log and publish analytics
        asyncLogService.logAndPublish(response, tenantId, prompt);

        return response;
    }
}
