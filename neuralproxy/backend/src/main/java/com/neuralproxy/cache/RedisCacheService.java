package com.neuralproxy.cache;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class RedisCacheService {

    private final StringRedisTemplate redisTemplate;

    public RedisCacheService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Optional<String> get(String prompt, String tenantId) {
        try {
            String key = buildKey(prompt, tenantId);
            String value = redisTemplate.opsForValue().get(key);
            return Optional.ofNullable(value);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public void set(String prompt, String tenantId, String value, Duration ttl) {
        try {
            String key = buildKey(prompt, tenantId);
            redisTemplate.opsForValue().set(key, value, ttl);
        } catch (Exception e) {
            // Non-critical
        }
    }

    private String buildKey(String prompt, String tenantId) {
        String hash = md5(prompt);
        return "cache:" + hash + ":" + tenantId;
    }

    private String md5(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return input.hashCode() + "";
        }
    }
}
