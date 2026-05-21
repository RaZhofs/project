IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'EVENTOS' AND type = 'U')
BEGIN
  CREATE TABLE EVENTOS (
    id_evento        INT            NOT NULL IDENTITY(1,1),
    id_administrador INT            NOT NULL,
    id_tipo          INT            NOT NULL,
    nombre_evento    NVARCHAR(150)  NOT NULL,
    fecha_inicio     DATETIME2      NOT NULL,
    fecha_termino    DATETIME2      NOT NULL,
    aforo_maximo     INT            NOT NULL CONSTRAINT DF_EVENTOS_aforo    DEFAULT 0,
    estado_evento    NVARCHAR(30)   NOT NULL CONSTRAINT DF_EVENTOS_estado   DEFAULT N'Planificación',
    modalidad_evento NVARCHAR(30)   NOT NULL CONSTRAINT DF_EVENTOS_modal    DEFAULT N'Desde cero',
    ubicacion_texto  NVARCHAR(255)  NULL,
    creado_by        INT            NOT NULL,
    CONSTRAINT PK_EVENTOS          PRIMARY KEY (id_evento),
    CONSTRAINT FK_EVENTOS_admin    FOREIGN KEY (id_administrador) REFERENCES ADMINISTRADORES (id_administrador),
    CONSTRAINT FK_EVENTOS_tipo     FOREIGN KEY (id_tipo)          REFERENCES TIPOS_EVENTO    (id_tipo)
  );
END
