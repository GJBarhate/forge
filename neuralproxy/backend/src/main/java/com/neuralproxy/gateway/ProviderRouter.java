package com.neuralproxy.gateway;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ProviderRouter {

    @Value("${gemini.api.keys}")
    private String geminiKeysRaw;

    @Value("${openai.api.keys}")
    private String openaiKeysRaw;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final AtomicInteger geminiKeyIndex = new AtomicInteger(0);
    private final AtomicInteger openaiKeyIndex = new AtomicInteger(0);

    private final ConcurrentHashMap<String, AtomicLong> latencyTracker = new ConcurrentHashMap<>();

    public record ProviderResponse(String text, String provider, long latencyMs, int tokenCount, BigDecimal costUsd) {}

    public ProviderResponse route(String prompt, String preferredProvider) {
        String provider = chooseProvider(preferredProvider);

        if ("OPENAI".equalsIgnoreCase(provider)) {
            try {
                return callOpenAI(prompt);
            } catch (Exception e) {
                return callGeminiFallback(prompt);
            }
        } else {
            try {
                return callGemini(prompt);
            } catch (Exception e) {
                return callOpenAIFallback(prompt);
            }
        }
    }

    private String chooseProvider(String preferred) {
        if (preferred != null && (preferred.equalsIgnoreCase("GEMINI") || preferred.equalsIgnoreCase("OPENAI"))) {
            return preferred.toUpperCase();
        }
        long geminiLatency = getAvgLatency("GEMINI");
        long openaiLatency = getAvgLatency("OPENAI");
        return geminiLatency <= openaiLatency ? "GEMINI" : "OPENAI";
    }

    private long getAvgLatency(String provider) {
        AtomicLong latency = latencyTracker.get(provider);
        return latency != null ? latency.get() : 500L;
    }

    private void recordLatency(String provider, long latencyMs) {
        latencyTracker.compute(provider, (k, existing) -> {
            if (existing == null) return new AtomicLong(latencyMs);
            existing.set((existing.get() + latencyMs) / 2);
            return existing;
        });
    }

    @CircuitBreaker(name = "gemini", fallbackMethod = "callGeminiFallback")
    public ProviderResponse callGemini(String prompt) {
        long start = System.currentTimeMillis();
        try {
            List<String> keys = List.of(geminiKeysRaw.split(","));
            String key = keys.get(Math.abs(geminiKeyIndex.getAndIncrement() % keys.size())).trim();

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + key;
            String body = objectMapper.writeValueAsString(Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());

            String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            int tokens = root.path("usageMetadata").path("totalTokenCount").asInt(100);
            long latency = System.currentTimeMillis() - start;
            recordLatency("GEMINI", latency);

            BigDecimal cost = BigDecimal.valueOf(tokens * 0.000001);
            return new ProviderResponse(text, "GEMINI", latency, tokens, cost);
        } catch (Exception e) {
            throw new RuntimeException("Gemini call failed: " + e.getMessage(), e);
        }
    }

    public ProviderResponse callGeminiFallback(String prompt, Throwable t) {
        return callOpenAI(prompt);
    }

    public ProviderResponse callGeminiFallback(String prompt) {
        return callOpenAI(prompt);
    }

    @CircuitBreaker(name = "openai", fallbackMethod = "callOpenAIFallback")
    public ProviderResponse callOpenAI(String prompt) {
        long start = System.currentTimeMillis();
        try {
            List<String> keys = List.of(openaiKeysRaw.split(","));
            String key = keys.get(Math.abs(openaiKeyIndex.getAndIncrement() % keys.size())).trim();

            String body = objectMapper.writeValueAsString(Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens", 1000
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + key)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());

            String text = root.path("choices").get(0).path("message").path("content").asText();
            int tokens = root.path("usage").path("total_tokens").asInt(100);
            long latency = System.currentTimeMillis() - start;
            recordLatency("OPENAI", latency);

            BigDecimal cost = BigDecimal.valueOf(tokens * 0.0000002);
            return new ProviderResponse(text, "OPENAI", latency, tokens, cost);
        } catch (Exception e) {
            throw new RuntimeException("OpenAI call failed: " + e.getMessage(), e);
        }
    }

    public ProviderResponse callOpenAIFallback(String prompt, Throwable t) {
        long latency = 0L;
        return new ProviderResponse(
            "Service temporarily unavailable. Both providers are experiencing issues. Please try again later.",
            "FALLBACK", latency, 0, BigDecimal.ZERO
        );
    }
}
