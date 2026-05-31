package com.neuralproxy.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Ensure the seeded admin user has the correct BCrypt password hash
        // This re-hashes at startup to guarantee correctness regardless of seed hash
        List<Map<String, Object>> users = jdbcTemplate.queryForList(
            "SELECT id, password_hash FROM users WHERE email = 'admin@neuralproxy.dev'"
        );
        if (!users.isEmpty()) {
            String existingHash = (String) users.get(0).get("password_hash");
            // Only update if hash doesn't match (e.g., seed hash was a placeholder)
            if (!passwordEncoder.matches("admin123", existingHash)) {
                String correctHash = passwordEncoder.encode("admin123");
                jdbcTemplate.update(
                    "UPDATE users SET password_hash = ? WHERE email = 'admin@neuralproxy.dev'",
                    correctHash
                );
            }
        }
    }
}
