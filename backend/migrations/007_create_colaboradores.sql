IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'COLABORADORES' AND type = 'U')
BEGIN
  CREATE TABLE COLABORADORES (
    id_colaborador  INT           NOT NULL IDENTITY(1,1),
    id_usuario      INT           NOT NULL,
    nombre_completo NVARCHAR(150) NOT NULL,
    correo_empresa  NVARCHAR(150) NULL,
    telefono        NVARCHAR(30)  NULL,
    CONSTRAINT PK_COLABORADORES          PRIMARY KEY (id_colaborador),
    CONSTRAINT FK_COLABORADORES_usuario  FOREIGN KEY (id_usuario) REFERENCES USUARIOS (id_usuario)
  );
END
