-- Schema Conglomerado — Fase 1 — SQL Server (T-SQL)
-- Ejecutar en SSMS o sqlcmd. Requiere SQL Server 2016+ / SQL Server Express.

-- Crear base de datos si no existe
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'conglomerado_db')
  CREATE DATABASE conglomerado_db;
GO

USE conglomerado_db;
GO

-- 1. ROLES
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ROLES' AND type = 'U')
BEGIN
  CREATE TABLE ROLES (
    id_rol     INT          NOT NULL IDENTITY(1,1),
    nombre_rol NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_ROLES PRIMARY KEY (id_rol)
  );
END
GO

-- 2. USUARIOS
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'USUARIOS' AND type = 'U')
BEGIN
  CREATE TABLE USUARIOS (
    id_usuario    INT           NOT NULL IDENTITY(1,1),
    nombre        NVARCHAR(100) NOT NULL,
    correo        NVARCHAR(150) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    id_rol        INT           NOT NULL,
    CONSTRAINT PK_USUARIOS        PRIMARY KEY (id_usuario),
    CONSTRAINT UQ_USUARIOS_correo UNIQUE      (correo),
    CONSTRAINT FK_USUARIOS_rol    FOREIGN KEY (id_rol) REFERENCES ROLES (id_rol)
  );
END
GO

-- 3. ADMINISTRADORES
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ADMINISTRADORES' AND type = 'U')
BEGIN
  CREATE TABLE ADMINISTRADORES (
    id_administrador INT           NOT NULL IDENTITY(1,1),
    id_usuario       INT           NOT NULL,
    nombre           NVARCHAR(100) NOT NULL,
    correo           NVARCHAR(150) NOT NULL,
    password_hash    NVARCHAR(255) NOT NULL,
    CONSTRAINT PK_ADMINISTRADORES         PRIMARY KEY (id_administrador),
    CONSTRAINT FK_ADMINISTRADORES_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS (id_usuario)
  );
END
GO

-- 4. TIPOS_EVENTO
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'TIPOS_EVENTO' AND type = 'U')
BEGIN
  CREATE TABLE TIPOS_EVENTO (
    id_tipo INT          NOT NULL IDENTITY(1,1),
    nombre  NVARCHAR(80) NOT NULL,
    CONSTRAINT PK_TIPOS_EVENTO PRIMARY KEY (id_tipo)
  );
END
GO

-- 5. EVENTOS
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'EVENTOS' AND type = 'U')
BEGIN
  CREATE TABLE EVENTOS (
    id_evento        INT           NOT NULL IDENTITY(1,1),
    id_administrador INT           NOT NULL,
    id_tipo          INT           NOT NULL,
    nombre_evento    NVARCHAR(150) NOT NULL,
    fecha_inicio     DATETIME2     NOT NULL,
    fecha_termino    DATETIME2     NOT NULL,
    aforo_maximo     INT           NOT NULL CONSTRAINT DF_EVENTOS_aforo  DEFAULT 0,
    estado_evento    NVARCHAR(30)  NOT NULL CONSTRAINT DF_EVENTOS_estado DEFAULT N'Planificación',
    modalidad_evento NVARCHAR(30)  NOT NULL CONSTRAINT DF_EVENTOS_modal  DEFAULT N'Desde cero',
    ubicacion_texto  NVARCHAR(255) NULL,
    creado_by        INT           NOT NULL,
    CONSTRAINT PK_EVENTOS       PRIMARY KEY (id_evento),
    CONSTRAINT FK_EVENTOS_admin FOREIGN KEY (id_administrador) REFERENCES ADMINISTRADORES (id_administrador),
    CONSTRAINT FK_EVENTOS_tipo  FOREIGN KEY (id_tipo)          REFERENCES TIPOS_EVENTO    (id_tipo)
  );
END
GO

-- 6. TAREAS (FK a COLABORADORES se agrega en Fase 2)
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'TAREAS' AND type = 'U')
BEGIN
  CREATE TABLE TAREAS (
    id_tarea         INT           NOT NULL IDENTITY(1,1),
    id_evento        INT           NOT NULL,
    id_responsable   INT           NULL,
    titulo           NVARCHAR(150) NOT NULL,
    descripcion      NVARCHAR(MAX) NULL,
    prioridad        NVARCHAR(10)  NOT NULL CONSTRAINT DF_TAREAS_prioridad DEFAULT N'Media',
    estado_tarea     NVARCHAR(20)  NOT NULL CONSTRAINT DF_TAREAS_estado    DEFAULT N'Pendiente',
    fecha_limite     DATETIME2     NOT NULL,
    fecha_completado DATETIME2     NULL,
    CONSTRAINT PK_TAREAS        PRIMARY KEY (id_tarea),
    CONSTRAINT FK_TAREAS_evento FOREIGN KEY (id_evento) REFERENCES EVENTOS (id_evento)
  );
END
GO
