-- Crear tabla de contactos telefónicos
CREATE TABLE IF NOT EXISTS contactos_telefonicos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    codigo_postal VARCHAR(10),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_contactos_telefono ON contactos_telefonicos(telefono);
CREATE INDEX IF NOT EXISTS idx_contactos_email ON contactos_telefonicos(email);
CREATE INDEX IF NOT EXISTS idx_contactos_fecha ON contactos_telefonicos(fecha_registro);

-- Insertar algunos datos de ejemplo
INSERT INTO contactos_telefonicos (nombre, telefono, email, codigo_postal) VALUES
('Juan Pérez', '+52 555 123 4567', 'juan.perez@email.com', '01000'),
('María González', '+52 555 987 6543', 'maria.gonzalez@email.com', '03100'),
('Carlos Ramírez', '+52 555 456 7890', 'carlos.ramirez@email.com', '06700')
ON CONFLICT DO NOTHING;

-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plan VARCHAR(20) DEFAULT 'gratuito' CHECK (plan IN ('gratuito', 'premium')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    max_leads INTEGER DEFAULT 100,
    max_api_calls INTEGER DEFAULT 1000,
    has_advanced_analytics BOOLEAN DEFAULT FALSE,
    has_automation BOOLEAN DEFAULT FALSE,
    has_custom_domain BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);