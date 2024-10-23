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
            throw new Error('Acceso no autorizado');
        }

        try {
            const nuevoEdificio = await addDoc(collection(this.db, this.collectionName), data);

            // Obtener el administrador para notificar sobre el nuevo edificio
            const administrador = await UsuariosManager.obtenerAdministrador(); // Supongamos que hay una función para obtener el administrador

            // Enviar notificación por correo al administrador
            if (administrador && administrador.email) {
                await enviarNotificacionEdificio(administrador.email, nuevoEdificio.id, data);
            }

            return { id: nuevoEdificio.id, ...data };
        } catch (error) {
            throw new Error('Error al crear el edificio: ' + error.message);
        }
    }

    // Función para obtener todos los edificios
    async obtenerEdificios() {
        try {
            const edificiosSnapshot = await getDocs(collection(this.db, this.collectionName));
            return edificiosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error('Error al obtener los edificios: ' + error.message);
        }
    }

    // Función para obtener un edificio por su ID
    async obtenerEdificioPorId(id) {
        try {
            const edificioDoc = await getDoc(doc(this.db, this.collectionName, id));
            if (!edificioDoc.exists()) {
                throw new Error('Edificio no encontrado');
            }
            return { id: edificioDoc.id, ...edificioDoc.data() };
        } catch (error) {
            throw new Error('Error al obtener el edificio: ' + error.message);
        }
    }

    // Función para actualizar un edificio existente
    async actualizarEdificio(id, data) {
        try {
            await updateDoc(doc(this.db, this.collectionName, id), data);
            return { id, ...data };
        } catch (error) {
            throw new Error('Error al actualizar el edificio: ' + error.message);
        }
    }

    // Función para eliminar un edificio
    async eliminarEdificio(id) {
        try {
            await deleteDoc(doc(this.db, this.collectionName, id));
            return { mensaje: 'Edificio eliminado' };
        } catch (error) {
            throw new Error('Error al eliminar el edificio: ' + error.message);
        }
    }
}

module.exports = new EdificiosManager();
