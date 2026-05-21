require('dotenv').config();
const { sequelize, Rol, Usuario, Administrador } = require('../src/models');

(async () => {
  try {
    await sequelize.authenticate();

    // 1. Garantizar que el rol Administrador existe
    const [rol] = await Rol.findOrCreate({
      where: { nombre_rol: 'Administrador' },
      defaults: { nombre_rol: 'Administrador' },
    });

    // 2. Crear el usuario base del administrador demo
    const [usuario] = await Usuario.findOrCreate({
      where: { correo: 'admin@convexa.com' },
      defaults: {
        nombre:        'Admin Demo',
        correo:        'admin@convexa.com',
        password_hash: 'demo_hash_no_usar_en_prod',
        id_rol:        rol.id_rol,
      },
    });

    // 3. Crear el registro en ADMINISTRADORES vinculado al usuario
    const [admin, created] = await Administrador.findOrCreate({
      where: { id_usuario: usuario.id_usuario },
      defaults: {
        id_usuario:    usuario.id_usuario,
        nombre:        'Admin Demo',
        correo:        'admin@convexa.com',
        password_hash: 'demo_hash_no_usar_en_prod',
      },
    });

    console.log(
      created ? '✓ Administrador demo creado.' : '✓ Administrador demo ya existía.',
      `\n  → id_administrador : ${admin.id_administrador}`,
      `\n  → id_usuario       : ${usuario.id_usuario}`,
    );
  } catch (err) {
    console.error('Error al sembrar admin demo:', err.message);
  } finally {
    await sequelize.close();
  }
})();
