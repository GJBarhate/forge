package com.neuralproxy.analytics;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequestLogRepository extends JpaRepository<RequestLog, UUID> {

    List<RequestLog> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    @Query("SELECT r FROM RequestLog r ORDER BY r.createdAt DESC")
    List<RequestLog> findRecentRequests(Pageable pageable);

    @Query("SELECT COUNT(r) FROM RequestLog r WHERE r.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(r) FROM RequestLog r")
    long countAll();

    @Query("SELECT AVG(r.latencyMs) FROM RequestLog r")
    Double avgLatency();

    @Query("SELECT SUM(r.costUsd) FROM RequestLog r")
    Double totalCost();

    @Query("SELECT COUNT(r) FROM RequestLog r WHERE r.cacheHit = true")
    long countCacheHits();

    @Query("SELECT r FROM RequestLog r WHERE r.createdAt >= :since ORDER BY r.createdAt ASC")
    List<RequestLog> findSince(@Param("since") LocalDateTime since);
}
