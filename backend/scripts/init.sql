-- Ejecuta este script en tu base de datos de Hostinger
-- mysql -h HOST -u USER -p DATABASE < scripts/init.sql

CREATE TABLE IF NOT EXISTS contacts (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(120) NOT NULL,
  empresa    VARCHAR(120) NOT NULL,
  email      VARCHAR(254) NOT NULL,
  telefono   VARCHAR(30)  DEFAULT NULL,
  servicio   VARCHAR(80)  DEFAULT NULL,
  mensaje    TEXT         DEFAULT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email      (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
