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

// Crear el middleware de multer
const upload = multer({ storage });

module.exports = upload; // Exportar el middleware para usarlo en otras partes de la aplicación
