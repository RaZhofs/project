-- Agrega la FK pendiente de Fase 1 ahora que COLABORADORES existe
IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys
  WHERE name = 'FK_TAREAS_responsable'
)
BEGIN
  ALTER TABLE TAREAS
    ADD CONSTRAINT FK_TAREAS_responsable
    FOREIGN KEY (id_responsable) REFERENCES COLABORADORES (id_colaborador);
END
