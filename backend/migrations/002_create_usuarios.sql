IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'USUARIOS' AND type = 'U')
BEGIN
  CREATE TABLE USUARIOS (
    id_usuario    INT           NOT NULL IDENTITY(1,1),
    nombre        NVARCHAR(100) NOT NULL,
    correo        NVARCHAR(150) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    id_rol        INT           NOT NULL,
    CONSTRAINT PK_USUARIOS          PRIMARY KEY (id_usuario),
    CONSTRAINT UQ_USUARIOS_correo   UNIQUE      (correo),
    CONSTRAINT FK_USUARIOS_rol      FOREIGN KEY (id_rol) REFERENCES ROLES (id_rol)
  );
END
