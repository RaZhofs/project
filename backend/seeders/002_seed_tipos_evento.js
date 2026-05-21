require('dotenv').config();
const { sequelize, TipoEvento } = require('../src/models');

const tipos = [
  { nombre: 'Conferencia' },
  { nombre: 'Taller' },
  { nombre: 'Seminario' },
  { nombre: 'Congreso' },
  { nombre: 'Exposición' },
  { nombre: 'Ceremonia' },
  { nombre: 'Feria' },
  { nombre: 'Reunión' },
];

(async () => {
  try {
    await sequelize.authenticate();
    for (const tipo of tipos) {
      await TipoEvento.findOrCreate({ where: { nombre: tipo.nombre }, defaults: tipo });
    }
    console.log(`${tipos.length} tipos de evento sembrados correctamente.`);
  } catch (err) {
    console.error('Error al sembrar tipos:', err.message);
  } finally {
    await sequelize.close();
  }
})();
