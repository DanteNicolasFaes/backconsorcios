import { db } from '../firebaseConfig.js'; // Usa la configuración centralizada de Firebase
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import jwt from 'jsonwebtoken';  // Importar jsonwebtoken para generar el token
import EmailManager from './EmailManager.js'; // Importa el EmailManager para enviar correos
import { Storage } from '@google-cloud/storage'; // Importa la librería de Google Cloud Storage
import path from 'path'; // Importa path para manejar rutas de archivos

// Clase para gestionar las invitaciones
class InvitacionesManager {
    constructor() {
        this.collectionName = 'invitaciones'; // Nombre de la colección en Firestore

        // Inicializa Google Cloud Storage
        this.storage = new Storage({
            projectId: process.env.GCLOUD_PROJECT_ID, // ID de tu proyecto en Google Cloud
            keyFilename: path.join(path.resolve(), 'path-to-your-service-account-file.json') // Ruta al archivo de credenciales
        });
        this.bucketName = process.env.GCLOUD_STORAGE_BUCKET; // Nombre del bucket
    }

    // Función para crear una nueva invitación (solo el administrador puede hacerlo)
    async crearInvitacion(data, usuario, archivos) {
        this.validarDatos(data);
        this.validarUsuario(usuario);

        // Subir archivos si existen
        let archivoUrls = [];
        if (archivos && archivos.length > 0) {
            archivoUrls = await Promise.all(archivos.map(archivo => this.subirArchivo(archivo)));
        }

        // Generamos el token de invitación con el correo del propietario/inquilino
        const token = this.generarTokenInvitacion(data.correo);

        try {
            const nuevaInvitacion = await addDoc(collection(db, this.collectionName), { ...data, archivoUrls, token });
            await EmailManager.enviarCorreo(data.correo, data.asunto, data.mensaje);
            return { id: nuevaInvitacion.id, ...data, archivoUrls, token };  // Incluimos el token en la respuesta
        } catch (error) {
            throw new Error('Error al crear la invitación: ' + error.message);
        }
    }

    // Función para generar el token de invitación
    generarTokenInvitacion(email) {
        const payload = {
            email: email,
            isAdmin: false,  // Establecemos que el rol es de propietario/inquilino
        };

        // Generamos el token con el payload, la clave secreta y un tiempo de expiración
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });  // Token con expiración de 1 hora
        return token;
    }

    // Función para subir los archivos a Google Cloud Storage
    async subirArchivo(archivo) {
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
    }

    // Función para listar todas las invitaciones
    async listarInvitaciones() {
        try {
            const snapshot = await getDocs(collection(db, this.collectionName));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Error al listar las invitaciones: ' + error.message);
        }
    }

    // Función para obtener detalles de una invitación específica
    async obtenerInvitacionPorId(id) {
        try {
            const docRef = doc(db, this.collectionName, id);
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

export default new InvitacionesManager();