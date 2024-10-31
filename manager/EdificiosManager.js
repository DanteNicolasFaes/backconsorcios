const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const { enviarNotificacionEdificio } = require('../services/mailer'); // Importar la función para enviar correos
const UsuariosManager = require('./UsuariosManager'); // Importar UsuariosManager para obtener el email del administrador

class EdificiosManager {
    constructor() {
        this.db = getFirestore();
        this.collectionName = 'edificios'; // Nombre de la colección en Firestore
    }

    // Función para crear un nuevo edificio
    async crearEdificio(data, esAdmin) {
        // Solo el administrador puede crear edificios
        if (!esAdmin) {
            throw new Error('Acceso no autorizado: solo el administrador puede crear edificios.');
        }

        // Validar los campos requeridos
        const { nombre, direccion, cantidadUnidades } = data;
        if (!nombre || !direccion || !cantidadUnidades) {
            throw new Error('Faltan datos obligatorios: nombre, dirección y cantidad de unidades.');
        }

        try {
            // Crear el edificio
            const nuevoEdificio = await addDoc(collection(this.db, this.collectionName), data);

            // Obtener el administrador para notificar sobre el nuevo edificio
            const administrador = await UsuariosManager.obtenerAdministrador();

            // Enviar notificación por correo al administrador si existe un email válido
            if (administrador && administrador.email) {
                await enviarNotificacionEdificio(administrador.email, nuevoEdificio.id, data);
            }

            return { id: nuevoEdificio.id, ...data };
        } catch (error) {
            throw new Error('Error al crear el edificio en Firestore: ' + error.message);
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
                throw new Error('Edificio no encontrado en Firestore');
            }
            return { id: edificioDoc.id, ...edificioDoc.data() };
        } catch (error) {
            throw new Error('Error al obtener el edificio desde Firestore: ' + error.message);
        }
    }

    // Función para actualizar un edificio existente
    async actualizarEdificio(id, data) {
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
