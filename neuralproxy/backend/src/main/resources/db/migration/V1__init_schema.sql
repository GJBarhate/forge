-- V1__init_schema.sql
-- NeuralProxy initial schema

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'FREE',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_hash VARCHAR(64),
    prompt_text TEXT,
    response TEXT,
    tenant_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    prompt TEXT,
    provider VARCHAR(50),
    latency_ms BIGINT,
    token_count INT,
    cost_usd DECIMAL(10,6),
    cache_hit BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE request_logs_p2025_01 PARTITION OF request_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE request_logs_p2025_02 PARTITION OF request_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE request_logs_p2025_03 PARTITION OF request_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE TABLE request_logs_p2025_04 PARTITION OF request_logs
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

CREATE TABLE request_logs_p2025_05 PARTITION OF request_logs
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

CREATE TABLE request_logs_p2025_06 PARTITION OF request_logs
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE TABLE request_logs_p2025_07 PARTITION OF request_logs
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE request_logs_p2025_08 PARTITION OF request_logs
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE request_logs_p2025_09 PARTITION OF request_logs
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE request_logs_p2025_10 PARTITION OF request_logs
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE request_logs_p2025_11 PARTITION OF request_logs
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE request_logs_p2025_12 PARTITION OF request_logs
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE TABLE request_logs_p2026_01 PARTITION OF request_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE request_logs_p2026_02 PARTITION OF request_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE request_logs_p2026_03 PARTITION OF request_logs
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE request_logs_p2026_04 PARTITION OF request_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE request_logs_p2026_05 PARTITION OF request_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE request_logs_p2026_06 PARTITION OF request_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE request_logs_p2026_07 PARTITION OF request_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE request_logs_p2026_08 PARTITION OF request_logs
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE request_logs_p2026_09 PARTITION OF request_logs
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE request_logs_p2026_10 PARTITION OF request_logs
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE request_logs_p2026_11 PARTITION OF request_logs
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE request_logs_p2026_12 PARTITION OF request_logs
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_request_logs_tenant_created ON request_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_cache_tenant ON prompt_cache(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prompt_cache_hash ON prompt_cache(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
