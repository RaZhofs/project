require('dotenv').config();
const { sequelize, Rol, Usuario, Colaborador } = require('../src/models');

(async () => {
  try {
    await sequelize.authenticate();

    const [rol] = await Rol.findOrCreate({
      where: { nombre_rol: 'Colaborador' },
      defaults: { nombre_rol: 'Colaborador' },
    });

    const [usuario] = await Usuario.findOrCreate({
      where: { correo: 'colab@convexa.com' },
      defaults: {
        nombre:        'Colaborador Demo',
        correo:        'colab@convexa.com',
        password_hash: 'demo_hash_no_usar_en_prod',
        id_rol:        rol.id_rol,
      },
    });

    const [colab, created] = await Colaborador.findOrCreate({
      where: { id_usuario: usuario.id_usuario },
      defaults: {
        id_usuario:      usuario.id_usuario,
        nombre_completo: 'Colaborador Demo',
        correo_empresa:  'colab@convexa.com',
        telefono:        null,
      },
    });

    console.log(
      created ? '✓ Colaborador demo creado.' : '✓ Colaborador demo ya existía.',
      `\n  → id_colaborador : ${colab.id_colaborador}`,
      `\n  → id_usuario     : ${usuario.id_usuario}`,
    );
  } catch (err) {
    console.error('Error al sembrar colaborador demo:', err.message);
  } finally {
    await sequelize.close();
  }
})();
