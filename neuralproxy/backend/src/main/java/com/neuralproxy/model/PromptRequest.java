package com.neuralproxy.model;

import lombok.Data;

@Data
public class PromptRequest {
    private String prompt;
    private String provider; // GEMINI, OPENAI, or null for auto
    private Integer maxTokens;
    private Double temperature;
}
