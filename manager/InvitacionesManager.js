// /manager/InvitacionesManager.js
const { getFirestore, collection, addDoc, getDocs, doc, getDoc } = require('firebase/firestore');
const EmailManager = require('./EmailManager'); // Importa el EmailManager para enviar correos
const { Storage } = require('@google-cloud/storage'); // Importa la librería de Google Cloud Storage
const path = require('path'); // Importa path para manejar rutas de archivos

// Clase para gestionar las invitaciones
class InvitacionesManager {
    constructor() {
        // Inicializa Firestore
        this.db = getFirestore();
        this.collectionName = 'invitaciones'; // Nombre de la colección en Firestore

        // Inicializa Google Cloud Storage
        this.storage = new Storage({
            projectId: process.env.GCLOUD_PROJECT_ID, // ID de tu proyecto en Google Cloud
            keyFilename: path.join(__dirname, '..', 'path-to-your-service-account-file.json') // Ruta al archivo de credenciales
        });
        this.bucketName = process.env.GCLOUD_STORAGE_BUCKET; // Nombre del bucket
    }

    // Función para crear una nueva invitación (solo el administrador puede hacerlo)
    async crearInvitacion(data, usuario, archivo) {
        // Validaciones
        this.validarDatos(data);
        this.validarUsuario(usuario);

        let archivoUrl = null;

        // Manejar el archivo si se proporciona
        if (archivo) {
            archivoUrl = await this.subirArchivo(archivo);
        }

        try {
            // Añade un nuevo documento a la colección de invitaciones
            const nuevaInvitacion = await addDoc(collection(this.db, this.collectionName), { ...data, archivoUrl });

            // Envía el correo electrónico con la invitación usando el EmailManager
            await EmailManager.enviarCorreo(data.correo, data.asunto, data.mensaje);

            // Retorna el ID de la nueva invitación junto con los datos
            return { id: nuevaInvitacion.id, ...data, archivoUrl };
        } catch (error) {
            // Manejo de errores al crear la invitación
            throw new Error('Error al crear la invitación: ' + error.message);
        }
    }

    // Función para subir el archivo a Google Cloud Storage
    async subirArchivo(archivo) {
        try {
            const nombreArchivo = path.basename(archivo.originalname);
            const blob = this.storage.bucket(this.bucketName).file(nombreArchivo);

            const stream = blob.createWriteStream({
                resumable: false,
                contentType: archivo.mimetype
            });

            return new Promise((resolve, reject) => {
                stream.on('error', (error) => {
                    reject(new Error('Error al subir el archivo: ' + error.message));
                });
                stream.on('finish', () => {
                    resolve(`https://storage.googleapis.com/${this.bucketName}/${nombreArchivo}`);
                });
                stream.end(archivo.buffer); // Asumiendo que el archivo es un buffer
            });
        } catch (error) {
            throw new Error('Error al manejar el archivo: ' + error.message);
        }
    }

    // Función para listar todas las invitaciones
    async listarInvitaciones() {
        try {
            const snapshot = await getDocs(collection(this.db, this.collectionName));
            const invitaciones = [];
            snapshot.forEach(doc => {
                invitaciones.push({ id: doc.id, ...doc.data() });
            });
            return invitaciones;
        } catch (error) {
            throw new Error('Error al listar las invitaciones: ' + error.message);
        }
    }

    // Función para obtener detalles de una invitación específica
    async obtenerInvitacionPorId(id) {
        try {
            const docRef = doc(this.db, this.collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('No se encontró la invitación');
            }
        } catch (error) {
            throw new Error('Error al obtener la invitación: ' + error.message);
        }
    }

    // Método para validar los datos de la invitación
    validarDatos(data) {
        const errores = [];
        if (!data.correo || typeof data.correo !== 'string' || !/\S+@\S+\.\S+/.test(data.correo)) {
            errores.push('El correo es obligatorio y debe tener un formato válido.');
        }
        if (!data.asunto || typeof data.asunto !== 'string') {
            errores.push('El asunto es obligatorio y debe ser una cadena de texto.');
        }
        if (!data.mensaje || typeof data.mensaje !== 'string') {
            errores.push('El mensaje es obligatorio y debe ser una cadena de texto.');
        }
        if (errores.length) {
            throw new Error(errores.join(' '));
        }
    }

    // Método para validar el usuario
    validarUsuario(usuario) {
        if (!usuario || usuario.rol !== 'administrador') {
            throw new Error('Solo el administrador puede crear invitaciones.');
        }
    }
}

// Exporta una instancia de la clase InvitacionesManager
module.exports = new InvitacionesManager();
