ALTER TABLE movimientos DROP CONSTRAINT movimientos_origen_check;
ALTER TABLE movimientos ADD CONSTRAINT movimientos_origen_check
    CHECK (origen IN ('MANUAL', 'IMPORT', 'NOTIFICACION', 'CHAT'));
