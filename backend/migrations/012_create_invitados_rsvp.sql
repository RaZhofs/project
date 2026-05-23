IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'INVITADOS_RSVP' AND type = 'U')
BEGIN
  CREATE TABLE INVITADOS_RSVP (
    id_rsvp         INT           NOT NULL IDENTITY(1,1),
    id_evento       INT           NOT NULL,
    nombre_invitado NVARCHAR(100) NOT NULL,
    correo          NVARCHAR(150) NOT NULL,
    telefono        NVARCHAR(30)  NULL,
    codigo_de_barra NVARCHAR(100) NULL,
    estado_invitado NVARCHAR(30)  NOT NULL CONSTRAINT DF_RSVP_estado DEFAULT N'Confirmado',
    fecha_registro  DATETIME2     NOT NULL CONSTRAINT DF_RSVP_fecha  DEFAULT GETDATE(),
    CONSTRAINT PK_INVITADOS_RSVP        PRIMARY KEY (id_rsvp),
    CONSTRAINT FK_INVITADOS_RSVP_evento FOREIGN KEY (id_evento) REFERENCES EVENTOS (id_evento)
  );
END
