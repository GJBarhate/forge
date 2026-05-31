package com.neuralproxy.cache;

import com.pgvector.PGvector;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SemanticCacheService {

    private final JdbcTemplate jdbcTemplate;
    private final EmbeddingService embeddingService;

    private static final double SIMILARITY_THRESHOLD = 0.08;

    public SemanticCacheService(JdbcTemplate jdbcTemplate, EmbeddingService embeddingService) {
        this.jdbcTemplate = jdbcTemplate;
        this.embeddingService = embeddingService;
    }

    public void save(String promptText, String response, UUID tenantId) {
        try {
            float[] embedding = embeddingService.embed(promptText);
            String promptHash = md5(promptText);
            PGvector pgvector = new PGvector(embedding);

            jdbcTemplate.update(
                "INSERT INTO prompt_cache (prompt_hash, prompt_text, response, embedding, tenant_id) VALUES (?, ?, ?, ?::vector, ?::uuid)",
                promptHash, promptText, response, pgvector.toString(), tenantId.toString()
            );
        } catch (Exception e) {
            // Cache save failure is non-critical
        }
    }

    public Optional<String> findSimilar(String promptText, UUID tenantId) {
        try {
            float[] embedding = embeddingService.embed(promptText);
            PGvector pgvector = new PGvector(embedding);

            List<Map<String, Object>> results = jdbcTemplate.queryForList(
                "SELECT response, (embedding <-> ?::vector) AS dist FROM prompt_cache WHERE tenant_id = ?::uuid ORDER BY embedding <-> ?::vector LIMIT 1",
                pgvector.toString(), tenantId.toString(), pgvector.toString()
            );

            if (!results.isEmpty()) {
                double dist = ((Number) results.get(0).get("dist")).doubleValue();
                if (dist < SIMILARITY_THRESHOLD) {
                    return Optional.of((String) results.get(0).get("response"));
                }
            }
        } catch (Exception e) {
            // Cache lookup failure is non-critical
        }
        return Optional.empty();
    }

    private String md5(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
