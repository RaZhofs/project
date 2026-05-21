IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ROLES' AND type = 'U')
BEGIN
  CREATE TABLE ROLES (
    id_rol     INT           NOT NULL IDENTITY(1,1),
    nombre_rol NVARCHAR(50)  NOT NULL,
    CONSTRAINT PK_ROLES PRIMARY KEY (id_rol)
  );
END
