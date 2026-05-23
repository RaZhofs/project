IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'EVENTOS') AND name = N'codigo_acceso'
)
BEGIN
  ALTER TABLE EVENTOS ADD codigo_acceso NVARCHAR(50) NULL;
END
