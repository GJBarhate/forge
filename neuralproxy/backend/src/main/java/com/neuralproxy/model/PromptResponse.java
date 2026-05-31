package com.neuralproxy.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromptResponse {
    private String text;
    private String provider;
    private Long latencyMs;
    private Integer tokenCount;
    private BigDecimal costUsd;
    private boolean cacheHit;
}
