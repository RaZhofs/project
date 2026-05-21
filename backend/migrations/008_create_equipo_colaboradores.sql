IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'EQUIPO_COLABORADORES' AND type = 'U')
BEGIN
  CREATE TABLE EQUIPO_COLABORADORES (
    id_evento        INT          NOT NULL,
    id_colaborador   INT          NOT NULL,
    permiso_nivel    NVARCHAR(30) NOT NULL CONSTRAINT DF_EQUIPO_permiso DEFAULT N'Lectura',
    fecha_asignacion DATETIME2    NOT NULL CONSTRAINT DF_EQUIPO_fecha   DEFAULT GETDATE(),
    CONSTRAINT PK_EQUIPO_COLABORADORES
      PRIMARY KEY (id_evento, id_colaborador),
    CONSTRAINT FK_EQUIPO_evento
      FOREIGN KEY (id_evento)      REFERENCES EVENTOS       (id_evento),
    CONSTRAINT FK_EQUIPO_colaborador
      FOREIGN KEY (id_colaborador) REFERENCES COLABORADORES (id_colaborador)
  );
END
