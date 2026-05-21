IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PRESUPUESTO_ITEMS' AND type = 'U')
BEGIN
  CREATE TABLE PRESUPUESTO_ITEMS (
    id_item          INT             NOT NULL IDENTITY(1,1),
    id_evento        INT             NOT NULL,
    descripcion      NVARCHAR(200)   NOT NULL,
    categoria        NVARCHAR(50)    NOT NULL,
    tipo             NVARCHAR(10)    NOT NULL CONSTRAINT DF_PRES_tipo    DEFAULT N'Egreso',
    monto_estimado   DECIMAL(12,2)   NOT NULL CONSTRAINT DF_PRES_estim   DEFAULT 0,
    monto_real       DECIMAL(12,2)   NULL,
    estado           NVARCHAR(20)    NOT NULL CONSTRAINT DF_PRES_estado  DEFAULT N'Pendiente',
    CONSTRAINT PK_PRESUPUESTO_ITEMS        PRIMARY KEY (id_item),
    CONSTRAINT FK_PRESUPUESTO_ITEMS_evento FOREIGN KEY (id_evento) REFERENCES EVENTOS (id_evento)
  );
END
