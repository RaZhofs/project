require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const { sequelize } = require('./models');
const errorHandler  = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Tarea 2 — rutas del API se conectan aquí
// app.use('/api/v1', require('./routes'));

app.get('/api/v1/health', (req, res) => {
  res.json({ ok: true, message: 'Conglomerado API funcionando' });
});

app.use(errorHandler);

sequelize
  .authenticate()
  .then(() => {
    console.log('Conexión a MySQL establecida.');
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  });
