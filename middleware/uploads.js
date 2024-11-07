// /middleware/upload.js
const multer = require('multer');

// Configuración de multer para almacenar archivos en la carpeta 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Carpeta donde se guardarán los archivos subidos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para el archivo
    },
});

// Crear el middleware de multer para manejar varios archivos
const upload = multer({ storage }).array('files'); // Permite la subida de múltiples archivos con el campo 'files'

module.exports = upload; // Exportar el middleware para usarlo en otras partes de la aplicación
