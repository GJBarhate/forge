package com.neuralproxy.tenant;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final JdbcTemplate jdbcTemplate;

    public TenantService(TenantRepository tenantRepository, JdbcTemplate jdbcTemplate) {
        this.tenantRepository = tenantRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public Tenant createTenant(String name, String plan) {
        Tenant tenant = Tenant.builder()
                .name(name)
                .plan(plan != null ? plan : "FREE")
                .active(true)
                .build();
        return tenantRepository.save(tenant);
    }

    public Map<String, String> generateApiKey(UUID tenantId) {
        String rawKey = "np_" + UUID.randomUUID().toString().replace("-", "");
        String keyPrefix = rawKey.substring(0, Math.min(8, rawKey.length()));
        String keyHash = sha256(rawKey);

        jdbcTemplate.update(
            "INSERT INTO api_keys (id, key_hash, key_prefix, tenant_id, active) VALUES (?::uuid, ?, ?, ?::uuid, true)",
            UUID.randomUUID().toString(), keyHash, keyPrefix, tenantId.toString()
        );

        return Map.of(
            "key", rawKey,
            "keyPrefix", keyPrefix,
            "tenantId", tenantId.toString()
        );
    }

    public List<Map<String, Object>> getApiKeysForTenant(UUID tenantId) {
        return jdbcTemplate.queryForList(
            "SELECT id, key_prefix, active, created_at FROM api_keys WHERE tenant_id = ?::uuid ORDER BY created_at DESC",
            tenantId.toString()
        );
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 failed", e);
        }
    }
}
