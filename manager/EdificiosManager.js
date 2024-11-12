const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const { enviarNotificacionEdificio } = require('../services/mailer'); // Importar la función para enviar correos
const UsuariosManager = require('./UsuariosManager'); // Importar UsuariosManager para obtener el email del administrador

class EdificiosManager {
    constructor() {
        this.db = getFirestore();
        this.collectionName = process.env.FIREBASE_EDIFICIOS_COLLECTION || 'edificios'; // Nombre de la colección en Firestore
    }

    // Función para crear un nuevo edificio
    async crearEdificio(data, esAdmin) {
        // Solo el administrador puede crear edificios
        if (!esAdmin) {
            throw new Error('Acceso no autorizado: solo el administrador puede crear edificios.');
        }

        // Validación de los campos requeridos y de cantidadUnidades
        const { nombre, direccion, cantidadUnidades } = data;
        if (!nombre || !direccion || !cantidadUnidades || typeof cantidadUnidades !== 'number' || cantidadUnidades <= 0) {
            throw new Error('Datos inválidos: asegúrate de que nombre, dirección y cantidad de unidades sean correctos.');
        }

        try {
            // Crear el edificio en Firestore
            const nuevoEdificio = await addDoc(collection(this.db, this.collectionName), data);

            // Llamar a la función asíncrona para enviar notificación al administrador
            this.enviarNotificacionAdministrador(nuevoEdificio.id, data);

            return { id: nuevoEdificio.id, ...data };
        } catch (error) {
            throw new Error('Error al crear el edificio en Firestore: ' + error.message);
        }
    }

    // Función para enviar notificación al administrador (asíncrona)
    async enviarNotificacionAdministrador(nuevoEdificioId, data) {
        try {
            const administrador = await UsuariosManager.obtenerAdministrador();
            if (administrador && administrador.email) {
                await enviarNotificacionEdificio(administrador.email, nuevoEdificioId, data);
            }
        } catch (error) {
            console.error('Error al enviar la notificación por correo:', error.message);
        }
    }

    // Función para obtener todos los edificios
    async obtenerEdificios() {
        try {
            const edificiosSnapshot = await getDocs(collection(this.db, this.collectionName));
            return edificiosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Error al obtener los edificios desde Firestore: ' + error.message);
        }
    }

    // Función para obtener un edificio por su ID
    async obtenerEdificioPorId(id) {
        try {
            const edificioDoc = await getDoc(doc(this.db, this.collectionName, id));
            if (!edificioDoc.exists()) {
                return { mensaje: 'Edificio no encontrado en Firestore' };
            }
            return { id: edificioDoc.id, ...edificioDoc.data() };
        } catch (error) {
            throw new Error('Error al obtener el edificio desde Firestore: ' + error.message);
        }
    }

    // Función para actualizar un edificio existente
    async actualizarEdificio(id, data) {
        // Validación de cantidadUnidades si se actualiza
        if (data.cantidadUnidades && (typeof data.cantidadUnidades !== 'number' || data.cantidadUnidades <= 0)) {
            throw new Error('Datos inválidos: cantidad de unidades debe ser un número positivo.');
        }

        try {
            await updateDoc(doc(this.db, this.collectionName, id), data);
            return { id, ...data };
        } catch (error) {
            throw new Error('Error al actualizar el edificio en Firestore: ' + error.message);
        }
    }

    // Función para eliminar un edificio
    async eliminarEdificio(id) {
        try {
            await deleteDoc(doc(this.db, this.collectionName, id));
            return { mensaje: 'Edificio eliminado de Firestore' };
        } catch (error) {
            throw new Error('Error al eliminar el edificio en Firestore: ' + error.message);
        }
    }
}

module.exports = new EdificiosManager();
