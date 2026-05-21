require('dotenv').config();
const { sequelize, Rol } = require('../src/models');

const roles = [
  { nombre_rol: 'Administrador' },
  { nombre_rol: 'Colaborador' },
];

(async () => {
  try {
    await sequelize.authenticate();
    for (const rol of roles) {
      await Rol.findOrCreate({ where: { nombre_rol: rol.nombre_rol }, defaults: rol });
    }
    console.log('Roles sembrados correctamente.');
  } catch (err) {
    console.error('Error al sembrar roles:', err.message);
  } finally {
    await sequelize.close();
  }
})();
