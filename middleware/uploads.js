// /middleware/uploads.js
const multer = require('multer');
const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK si aún no está inicializado
if (!admin.apps.length) {
    admin.initializeApp();
}

const storage = admin.storage().bucket();  // Acceder al bucket de Firebase Storage

// Configuración de multer para almacenar archivos en un almacenamiento temporal
const upload = multer({
    storage: multer.memoryStorage(),  // Usamos memoria temporal en lugar de disco
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de tamaño de archivo (5 MB)
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'image/jpeg') {
            return cb(new Error('Solo se permiten archivos JPEG'));
        }
        cb(null, true);
    }
}).array('files');  // Permite la subida de múltiples archivos

// Función para subir los archivos a Firebase Storage
const subirArchivoAFirebase = async (file) => {
    const archivoPath = `uploads/${Date.now()}-${file.originalname}`; // Ruta en Firebase Storage
    const fileUpload = storage.file(archivoPath);

    // Subir archivo a Firebase Storage
    await fileUpload.save(file.buffer, {
        contentType: file.mimetype,
        public: true,  // Hacerlo público para acceder desde una URL
    });

    // Obtener la URL pública del archivo
    const fileUrl = `https://storage.googleapis.com/${storage.name}/${archivoPath}`;

    return fileUrl;
};

// Middleware para manejar archivos y subirlos a Firebase Storage
const uploadAndStoreUrls = async (req, res, next) => {
    if (req.files) {
        try {
            // Subir los archivos a Firebase Storage y obtener sus URLs
            const fileUrls = await Promise.all(req.files.map(subirArchivoAFirebase));
            
            // Guardar las URLs en el objeto de solicitud para ser usadas en las rutas
            req.fileUrls = fileUrls;
            next();
        } catch (error) {
            next(error);  // Manejo de errores si algo sale mal
        }
    } else {
        next();  // Si no hay archivos, continuar con el siguiente middleware o ruta
    }
};

module.exports = { upload, uploadAndStoreUrls };
