USE conglomerado_db;

DECLARE @id_rol      INT;
DECLARE @id_usuario  INT;

-- 1. Rol Administrador
IF NOT EXISTS (SELECT 1 FROM ROLES WHERE nombre_rol = 'Administrador')
  INSERT INTO ROLES (nombre_rol) VALUES ('Administrador');
SET @id_rol = (SELECT id_rol FROM ROLES WHERE nombre_rol = 'Administrador');

-- 2. Usuario base
IF NOT EXISTS (SELECT 1 FROM USUARIOS WHERE correo = 'admin@convexa.com')
BEGIN
  INSERT INTO USUARIOS (nombre, correo, password_hash, id_rol)
  VALUES ('Admin Demo', 'admin@convexa.com', 'demo_hash_no_usar_en_prod', @id_rol);
END
SET @id_usuario = (SELECT id_usuario FROM USUARIOS WHERE correo = 'admin@convexa.com');

-- 3. Registro en ADMINISTRADORES
IF NOT EXISTS (SELECT 1 FROM ADMINISTRADORES WHERE id_usuario = @id_usuario)
BEGIN
  INSERT INTO ADMINISTRADORES (id_usuario, nombre, correo, password_hash)
  VALUES (@id_usuario, 'Admin Demo', 'admin@convexa.com', 'demo_hash_no_usar_en_prod');
END

-- Confirmar IDs generados
SELECT
  a.id_administrador,
  u.id_usuario,
  u.correo
FROM ADMINISTRADORES a
JOIN USUARIOS u ON u.id_usuario = a.id_usuario
WHERE u.correo = 'admin@convexa.com';
