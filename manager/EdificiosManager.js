// /manager/EdificiosManager.js
// Importa las funciones necesarias de Firebase
const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const admin = require('firebase-admin'); // Esta línea se puede quitar si no se usa admin

// Clase para gestionar los edificios
class EdificiosManager {
    constructor() {
        // Inicializa Firestore
        this.db = getFirestore();
        this.collectionName = 'edificios'; // Nombre de la colección en Firestore
    }

    // Función para crear un nuevo edificio
    async crearEdificio(data) {
        try {
            // Añade un nuevo documento a la colección de edificios
            const nuevoEdificio = await addDoc(collection(this.db, this.collectionName), data);
            // Retorna el ID del nuevo edificio junto con los datos
            return { id: nuevoEdificio.id, ...data };
        } catch (error) {
            // Manejo de errores al crear el edificio
            throw new Error('Error al crear el edificio: ' + error.message);
        }
    }

    // Función para obtener todos los edificios
    async obtenerEdificios() {
        try {
            // Obtiene todos los documentos de la colección de edificios
            const edificiosSnapshot = await getDocs(collection(this.db, this.collectionName));
            // Mapea los documentos a un array de objetos
            return edificiosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            // Manejo de errores al obtener los edificios
            throw new Error('Error al obtener los edificios: ' + error.message);
        }
    }

    // Función para obtener un edificio por su ID
    async obtenerEdificioPorId(id) {
        try {
            // Obtiene el documento específico del edificio por ID
            const edificioDoc = await getDoc(doc(this.db, this.collectionName, id));
            // Verifica si el documento existe
            if (!edificioDoc.exists()) {
                throw new Error('Edificio no encontrado');
            }
            // Retorna los datos del edificio junto con su ID
            return { id: edificioDoc.id, ...edificioDoc.data() };
        } catch (error) {
            // Manejo de errores al obtener el edificio
            throw new Error('Error al obtener el edificio: ' + error.message);
        }
    }

    // Función para actualizar un edificio existente
    async actualizarEdificio(id, data) {
        try {
            // Actualiza el documento del edificio en Firestore
            await updateDoc(doc(this.db, this.collectionName, id), data);
            // Retorna los datos actualizados del edificio
            return { id, ...data };
        } catch (error) {
            // Manejo de errores al actualizar el edificio
            throw new Error('Error al actualizar el edificio: ' + error.message);
        }
    }

    // Función para eliminar un edificio
    async eliminarEdificio(id) {
        try {
            // Elimina el documento del edificio en Firestore
            await deleteDoc(doc(this.db, this.collectionName, id));
            // Retorna un mensaje de confirmación
            return { mensaje: 'Edificio eliminado' };
        } catch (error) {
            // Manejo de errores al eliminar el edificio
            throw new Error('Error al eliminar el edificio: ' + error.message);
        }
    }
}

// Exporta una instancia de la clase EdificiosManager
module.exports = new EdificiosManager();
