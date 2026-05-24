-- Migración 015: agrega columna fecha_ingreso a INVITADOS_RSVP
-- Ejecutar en: ConvexaDB
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'INVITADOS_RSVP') AND name = N'fecha_ingreso'
)
BEGIN
  ALTER TABLE INVITADOS_RSVP ADD fecha_ingreso DATETIME NULL;
END
