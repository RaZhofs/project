IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'BITACORA' AND type = 'U')
BEGIN
  CREATE TABLE BITACORA (
    id_entrada   INT            NOT NULL IDENTITY(1,1),
    id_evento    INT            NOT NULL,
    autor_nombre NVARCHAR(100)  NOT NULL,
    autor_rol    NVARCHAR(30)   NOT NULL,
    tipo_entrada NVARCHAR(30)   NOT NULL CONSTRAINT DF_BITACORA_tipo DEFAULT N'Nota',
    contenido    NVARCHAR(MAX)  NOT NULL,
    fecha_entrada DATETIME2     NOT NULL CONSTRAINT DF_BITACORA_fecha DEFAULT GETDATE(),
    CONSTRAINT PK_BITACORA        PRIMARY KEY (id_entrada),
    CONSTRAINT FK_BITACORA_evento FOREIGN KEY (id_evento) REFERENCES EVENTOS (id_evento)
  );
END
