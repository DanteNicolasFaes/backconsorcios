// /middleware/uploads.js
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

// Configuración de multer con límite de tamaño y filtro de tipo de archivo
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de tamaño de archivo (5 MB)
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'image/jpeg') {
            return cb(new Error('Solo se permiten archivos JPEG'));
        }
        cb(null, true);
    }
}).array('files'); // Permite la subida de múltiples archivos

module.exports = upload;
