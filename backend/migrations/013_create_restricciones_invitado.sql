IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'RESTRICCIONES_INVITADO' AND type = 'U')
BEGIN
  CREATE TABLE RESTRICCIONES_INVITADO (
    id_restriccion INT           NOT NULL IDENTITY(1,1),
    id_rsvp        INT           NOT NULL,
    tipo           NVARCHAR(30)  NOT NULL,
    descripcion    NVARCHAR(MAX) NULL,
    CONSTRAINT PK_RESTRICCIONES_INVITADO       PRIMARY KEY (id_restriccion),
    CONSTRAINT FK_RESTRICCIONES_rsvp           FOREIGN KEY (id_rsvp) REFERENCES INVITADOS_RSVP (id_rsvp)
  );
END
