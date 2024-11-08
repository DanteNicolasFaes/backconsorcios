// routes/email.js
const express = require('express');
const router = express.Router();
const EmailManager = require('../manager/EmailManager');
const authenticateUser = require('../middleware/authenticateUser'); // Middleware para autenticar al usuario
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para verificar que el usuario sea administrador
const multer = require('multer'); // Usamos multer para manejar la subida de archivos
const fs = require('fs'); // Importar el módulo fs para eliminar archivos si es necesario

// Configuración de Multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre del archivo
    }
});
const upload = multer({ storage });

// Ruta para enviar un correo electrónico
router.post('/enviar', authenticateUser, verifyAdmin, upload.single('archivo'), async (req, res) => {
    const { destinatario, asunto, mensaje } = req.body;

    // Validaciones
    if (!destinatario || !asunto || !mensaje) {
        return res.status(400).json({ mensaje: 'Faltan datos necesarios: destinatario, asunto y mensaje son obligatorios.' });
    }

    // Si hay un archivo adjunto, se puede usar req.file
    const archivoAdjunto = req.file ? req.file.path : null; // Guarda la ruta del archivo, si existe

    try {
        // Enviar correo utilizando EmailManager
        const resultado = await EmailManager.enviarCorreo(destinatario, asunto, mensaje, archivoAdjunto);
        
        // Si se subió un archivo y no es necesario después del envío, eliminamos el archivo
        if (archivoAdjunto) {
            fs.unlinkSync(archivoAdjunto); // Eliminar el archivo del servidor
        }
        
        return res.status(200).json(resultado); // Respuesta exitosa
    } catch (error) {
        // Manejar errores específicos si es necesario
        if (error.message.includes('formato válido')) {
            return res.status(400).json({ mensaje: 'Error de formato en el correo: ' + error.message }); // Error de formato de correo
        }
        // Manejar errores de envío de correo
        console.error('Error al enviar el correo: ', error); // Log de error
        return res.status(500).json({ mensaje: 'Error al enviar el correo: ' + error.message }); // Error general
    }
});

module.exports = router; // Exportar el router para usarlo en el servidor
