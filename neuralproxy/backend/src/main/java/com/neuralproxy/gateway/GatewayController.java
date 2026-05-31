package com.neuralproxy.gateway;

import com.neuralproxy.model.PromptRequest;
import com.neuralproxy.model.PromptResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

@RestController
@RequestMapping("/gateway")
public class GatewayController {

    private final GatewayService gatewayService;

    public GatewayController(GatewayService gatewayService) {
        this.gatewayService = gatewayService;
    }

    @PostMapping("/prompt")
    public ResponseEntity<PromptResponse> handlePrompt(
            @RequestBody PromptRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        UUID tenantId = resolveTenantId(authentication, httpRequest);
        PromptResponse response = gatewayService.process(request, tenantId);
        return ResponseEntity.ok(response);
    }

    private UUID resolveTenantId(Authentication authentication, HttpServletRequest httpRequest) {
        // Try API key tenant (set by ApiKeyFilter)
        Object tenantAttr = httpRequest.getAttribute("tenantId");
        if (tenantAttr != null) {
            return UUID.fromString(tenantAttr.toString());
        }
        // Try JWT tenant (stored in auth details)
        if (authentication != null && authentication.getDetails() instanceof String details && !details.isBlank()) {
            return UUID.fromString(details);
        }
        // Default tenant
        return UUID.fromString("00000000-0000-0000-0000-000000000001");
    }
}
