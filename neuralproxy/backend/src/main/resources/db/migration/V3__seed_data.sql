-- V3__seed_data.sql
-- Seed data for NeuralProxy

-- Admin tenant
INSERT INTO tenants (id, name, plan, active)
VALUES ('00000000-0000-0000-0000-000000000001', 'NeuralProxy Admin', 'PRO', true)
ON CONFLICT (id) DO NOTHING;

-- Admin user: email=admin@neuralproxy.dev, password=admin123
-- BCrypt hash of 'admin123' with cost 10
INSERT INTO users (id, email, password_hash, role, tenant_id)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'admin@neuralproxy.dev',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (email) DO NOTHING;

-- Demo API key
-- raw key = 'np_demo_key_123456'
-- SHA-256('np_demo_key_123456') computed offline:
INSERT INTO api_keys (id, key_hash, key_prefix, tenant_id, active)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'b94b3943a1c2a1d5ab6f19c7dbea3bcfdd46c76c7f2a6af3f1a5ebf17236bb2',
    'np_demo_k',
    '00000000-0000-0000-0000-000000000001',
    true
)
ON CONFLICT (key_hash) DO NOTHING;

-- Demo tenant
INSERT INTO tenants (id, name, plan, active)
VALUES ('00000000-0000-0000-0000-000000000004', 'Demo Tenant', 'FREE', true)
ON CONFLICT (id) DO NOTHING;
