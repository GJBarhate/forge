package com.neuralproxy.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    // In-process rate limiting with ConcurrentHashMap (works without Redis bucket4j-redis dependency issues)
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket getBucket(String tenantId) {
        return buckets.computeIfAbsent(tenantId, k ->
            Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(100)
                    .refillGreedy(100, Duration.ofMinutes(1))
                    .build())
                .build()
        );
    }

    public boolean canConsume(String tenantId) {
        return getBucket(tenantId).tryConsume(1);
    }
}
