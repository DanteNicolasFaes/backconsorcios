// /routes/quejas.js
const express = require('express');  // Importar express para crear la ruta
const multer = require('multer');  // Importar Multer para el manejo de archivos
const QuejasManager = require('../manager/QuejasManager');  // Importar el gestor de quejas
const { authenticateUser } = require('../middleware/authenticate');  // Middleware para autenticar usuarios

// Configuración de Multer para permitir múltiples archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);  // Nombre del archivo
    }
});
const upload = multer({ storage });  // Inicializar Multer con la configuración de almacenamiento

const router = express.Router();  // Crear el router de Express

// Ruta para crear una nueva queja
router.post('/', authenticateUser, upload.array('documentos', 10), async (req, res) => {
    try {
        // Extraemos los valores necesarios del cuerpo de la solicitud
        const { contenido, unidadFuncionalId } = req.body;
        const archivo = req.files.map(file => file.path);  // Los archivos se guardan en `req.files`
        const esPropietario = req.user.role === 'propietario' || req.user.role === 'inquilino';  // Verificamos que el usuario sea propietario o inquilino

        // Llamamos a `crearQueja` del `QuejasManager`, pasándole los datos necesarios
        const queja = await QuejasManager.crearQueja({ contenido }, archivo, unidadFuncionalId, esPropietario);

        res.status(201).json({ message: 'Queja creada con éxito', queja });  // Enviamos una respuesta exitosa con la queja creada
    } catch (error) {
        res.status(400).json({ message: error.message });  // Si hay un error, devolvemos el mensaje de error
    }
});

// Ruta para responder a una queja (solo para administradores)
router.put('/:id/responder', authenticateUser, async (req, res) => {
    const { respuesta } = req.body;
    const { id } = req.params;

    try {
        const resultado = await QuejasManager.responderQueja(id, respuesta);
        res.status(200).json({ message: resultado.message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Ruta para eliminar una queja (solo para administradores)
router.delete('/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await QuejasManager.eliminarQueja(id);
        res.status(200).json({ message: resultado.message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;  // Exportamos el router para usarlo en el archivo principal (server.js)
