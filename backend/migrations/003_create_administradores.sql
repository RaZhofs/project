IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ADMINISTRADORES' AND type = 'U')
BEGIN
  CREATE TABLE ADMINISTRADORES (
    id_administrador INT           NOT NULL IDENTITY(1,1),
    id_usuario       INT           NOT NULL,
    nombre           NVARCHAR(100) NOT NULL,
    correo           NVARCHAR(150) NOT NULL,
    password_hash    NVARCHAR(255) NOT NULL,
    CONSTRAINT PK_ADMINISTRADORES        PRIMARY KEY (id_administrador),
    CONSTRAINT FK_ADMINISTRADORES_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS (id_usuario)
  );
END
