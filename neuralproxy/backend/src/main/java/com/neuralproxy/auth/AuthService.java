package com.neuralproxy.auth;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Map<String, String> login(String email, String password) {
        List<Map<String, Object>> users = jdbcTemplate.queryForList(
            "SELECT id, email, password_hash, role, tenant_id FROM users WHERE email = ?", email
        );

        if (users.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        Map<String, Object> user = users.get(0);
        String storedHash = (String) user.get("password_hash");

        if (!passwordEncoder.matches(password, storedHash)) {
            throw new RuntimeException("Invalid credentials");
        }

        String role = (String) user.get("role");
        Object tenantIdObj = user.get("tenant_id");
        String tenantId = tenantIdObj != null ? tenantIdObj.toString() : "";
        String token = jwtUtil.generateToken(email, role, tenantId);

        return Map.of(
            "token", token,
            "email", email,
            "role", role,
            "tenantId", tenantId
        );
    }

    public Map<String, String> register(String email, String password, String tenantId) {
        String encodedPassword = passwordEncoder.encode(password);
        String userId = UUID.randomUUID().toString();

        jdbcTemplate.update(
            "INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES (?::uuid, ?, ?, 'USER', ?::uuid)",
            userId, email, encodedPassword, tenantId
        );

        String token = jwtUtil.generateToken(email, "USER", tenantId);
        return Map.of(
            "token", token,
            "email", email,
            "role", "USER",
            "tenantId", tenantId != null ? tenantId : ""
        );
    }
}
