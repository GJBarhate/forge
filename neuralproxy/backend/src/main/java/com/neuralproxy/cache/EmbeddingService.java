package com.neuralproxy.cache;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class EmbeddingService {

    @Value("${gemini.api.keys}")
    private String apiKeysRaw;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final AtomicInteger keyIndex = new AtomicInteger(0);

    private List<String> getApiKeys() {
        return List.of(apiKeysRaw.split(","));
    }

    private String nextKey() {
        List<String> keys = getApiKeys();
        int idx = Math.abs(keyIndex.getAndIncrement() % keys.size());
        return keys.get(idx).trim();
    }

    public float[] embed(String text) {
        try {
            String apiKey = nextKey();
            String url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=" + apiKey;

            String body = objectMapper.writeValueAsString(java.util.Map.of(
                "model", "models/text-embedding-004",
                "content", java.util.Map.of("parts", List.of(java.util.Map.of("text", text)))
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode values = root.path("embedding").path("values");

            float[] embedding = new float[values.size()];
            for (int i = 0; i < values.size(); i++) {
                embedding[i] = (float) values.get(i).asDouble();
            }
            return embedding;
        } catch (Exception e) {
            // Return zero vector on failure (cache will not match)
            return new float[768];
        }
    }
}
