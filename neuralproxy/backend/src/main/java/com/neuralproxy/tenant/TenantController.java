package com.neuralproxy.tenant;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Tenant>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Tenant> createTenant(@RequestBody CreateTenantRequest request) {
        return ResponseEntity.ok(tenantService.createTenant(request.name(), request.plan()));
    }

    @PostMapping("/{tenantId}/api-keys")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> generateApiKey(@PathVariable UUID tenantId) {
        return ResponseEntity.ok(tenantService.generateApiKey(tenantId));
    }

    @GetMapping("/{tenantId}/api-keys")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getApiKeys(@PathVariable UUID tenantId) {
        return ResponseEntity.ok(tenantService.getApiKeysForTenant(tenantId));
    }

    public record CreateTenantRequest(String name, String plan) {}
}
