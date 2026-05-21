-- id_responsable referencia COLABORADORES (Fase 2).
-- Se agrega la FOREIGN KEY en una migración futura sin romper esta tabla.
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'TAREAS' AND type = 'U')
BEGIN
  CREATE TABLE TAREAS (
    id_tarea         INT           NOT NULL IDENTITY(1,1),
    id_evento        INT           NOT NULL,
    id_responsable   INT           NULL,
    titulo           NVARCHAR(150) NOT NULL,
    descripcion      NVARCHAR(MAX) NULL,
    prioridad        NVARCHAR(10)  NOT NULL CONSTRAINT DF_TAREAS_prioridad DEFAULT N'Media',
    estado_tarea     NVARCHAR(20)  NOT NULL CONSTRAINT DF_TAREAS_estado   DEFAULT N'Pendiente',
    fecha_limite     DATETIME2     NOT NULL,
    fecha_completado DATETIME2     NULL,
    CONSTRAINT PK_TAREAS       PRIMARY KEY (id_tarea),
    CONSTRAINT FK_TAREAS_evento FOREIGN KEY (id_evento) REFERENCES EVENTOS (id_evento)
  );
END
