package com.neuralproxy.analytics;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "request_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Column(length = 50)
    private String provider;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "token_count")
    private Integer tokenCount;

    @Column(name = "cost_usd", precision = 10, scale = 6)
    private BigDecimal costUsd;

    @Column(name = "cache_hit")
    private Boolean cacheHit;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
