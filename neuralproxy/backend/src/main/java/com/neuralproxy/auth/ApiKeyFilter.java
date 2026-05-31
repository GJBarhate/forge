package com.neuralproxy.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Component
public class ApiKeyFilter extends OncePerRequestFilter {

    private final JdbcTemplate jdbcTemplate;

    public ApiKeyFilter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith("/gateway/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String apiKey = request.getHeader("X-API-Key");

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String keyHash = sha256(apiKey);
                List<Map<String, Object>> results = jdbcTemplate.queryForList(
                    "SELECT ak.tenant_id FROM api_keys ak WHERE ak.key_hash = ? AND ak.active = true",
                    keyHash
                );

                if (!results.isEmpty()) {
                    String tenantId = results.get(0).get("tenant_id").toString();
                    request.setAttribute("tenantId", tenantId);

                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        "api-client-" + tenantId,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_API_CLIENT"))
                    );
                    auth.setDetails(tenantId);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                // Invalid API key — continue without setting auth
            }
        }

        filterChain.doFilter(request, response);
    }

    private String sha256(String input) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
