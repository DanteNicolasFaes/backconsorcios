// server.js

require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authenticateUser = require('./middleware/authenticateUser');
const verifyAdmin = require('./middleware/verifyAdmin');
// const upload = require('./middleware/upload'); // Esta línea se puede eliminar

const firebaseAdmin = require('./firebaseConfig'); // Asegúrate de tener configurado Firebase

// Importar rutas
const configuracionFinancieraRoutes = require('./routes/configuracionFinanciera');
const documentosRoutes = require('./routes/documentos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(morgan('dev')); // Logger para ver las peticiones en consola
app.use(express.json()); // Parseo de JSON en las solicitudes

// Rutas
app.use('/api/configuracion-financiera', authenticateUser, verifyAdmin, configuracionFinancieraRoutes); // Rutas para configuraciones financieras
app.use('/api/documentos', authenticateUser, verifyAdmin, documentosRoutes); // Rutas para documentos

// Ruta base
app.get('/', (req, res) => {
    res.send('Bienvenido a la API de administración de consorcios');
});

// Manejo de errores de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
