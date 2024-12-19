import dotenv from 'dotenv'; // Cargar variables de entorno
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Importar rutas
import configuracionFinancieraRoutes from './routes/configuracion-financiera.js';
import documentosRoutes from './routes/documentos.js';
import edificiosRoutes from './routes/edificios.js';
import emailRoutes from './routes/email.js';
import encargadosRoutes from './routes/encargados.js';
import expensasRoutes from './routes/expensas.js';
import invitacionesRoutes from './routes/invitaciones.js';
import pagosRoutes from './routes/pagos.js';
import quejasRoutes from './routes/quejas.js';
import recibosSueldoRoutes from './routes/recibos-sueldo.js';
import usuariosRoutes from './routes/usuarios.js';

dotenv.config(); // Cargar variables de entorno

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(morgan('dev')); // Logger para ver las peticiones en consola
app.use(express.json()); // Parseo de JSON en las solicitudes

// Rutas
app.use('/api/configuracion-financiera', configuracionFinancieraRoutes); // Rutas para configuraciones financieras
app.use('/api/documentos', documentosRoutes); // Rutas para documentos
app.use('/api/edificios', edificiosRoutes); // Rutas para edificios
app.use('/api/email', emailRoutes); // Rutas para email
app.use('/api/encargados', encargadosRoutes); // Rutas para encargados
app.use('/api/expensas', expensasRoutes); // Rutas para expensas
app.use('/api/invitaciones', invitacionesRoutes); // Rutas para invitaciones
app.use('/api/pagos', pagosRoutes); // Rutas para pagos
app.use('/api/quejas', quejasRoutes); // Rutas para quejas
app.use('/api/recibos-sueldo', recibosSueldoRoutes); // Rutas para recibos de sueldo
app.use('/api/usuarios', usuariosRoutes); // Rutas para usuarios

// Ruta base
app.get('/', (req, res) => {
    res.send('Bienvenido a la API de administración de consorcios');
});

// Manejo de errores de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app; // Exportar la aplicación para pruebas