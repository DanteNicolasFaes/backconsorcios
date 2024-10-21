// /manager/UsuariosManager.js
const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const admin = require('firebase-admin');

class UsuariosManager {
    constructor() {
        // Inicializa Firestore
        this.db = getFirestore();
        this.collectionName = 'usuarios'; // Nombre de la colección en Firestore
    }

    // Método para crear un nuevo usuario
    async crearUsuario(data, esAdmin) {
        // Validación: solo el administrador puede crear un usuario
        if (!esAdmin) {
            throw new Error('Acceso no autorizado'); // Error si no es administrador
        }

        try {
            const nuevoUsuario = await addDoc(collection(this.db, this.collectionName), data);
            return { id: nuevoUsuario.id, ...data }; // Retorna el nuevo usuario con su ID
        } catch (error) {
            throw new Error('Error al crear el usuario: ' + error.message); // Manejo de errores
        }
    }

    // Método para obtener todos los usuarios
    async obtenerUsuarios() {
        try {
            const usuariosSnapshot = await getDocs(collection(this.db, this.collectionName));
            return usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Mapea los documentos a un array
        } catch (error) {
            throw new Error('Error al obtener los usuarios: ' + error.message); // Manejo de errores
        }
    }

    // Método para obtener un usuario por su ID
    async obtenerUsuarioPorId(id) {
        try {
            const usuarioDoc = await getDoc(doc(this.db, this.collectionName, id));
            if (!usuarioDoc.exists()) {
                throw new Error('Usuario no encontrado'); // Error si el usuario no existe
            }
            return { id: usuarioDoc.id, ...usuarioDoc.data() }; // Retorna el usuario encontrado
        } catch (error) {
            throw new Error('Error al obtener el usuario: ' + error.message); // Manejo de errores
        }
    }

    // Método para actualizar la información de un usuario
    async actualizarUsuario(id, data, esAdmin) {
        // Validación: solo el administrador puede actualizar un usuario
        if (!esAdmin) {
            throw new Error('Acceso no autorizado'); // Error si no es administrador
        }

        try {
            await updateDoc(doc(this.db, this.collectionName, id), data);
            return { id, ...data }; // Retorna el usuario actualizado
        } catch (error) {
            throw new Error('Error al actualizar el usuario: ' + error.message); // Manejo de errores
        }
    }

    // Método para eliminar un usuario
    async eliminarUsuario(id, esAdmin) {
        // Validación: solo el administrador puede eliminar un usuario
        if (!esAdmin) {
            throw new Error('Acceso no autorizado'); // Error si no es administrador
        }

        try {
            await deleteDoc(doc(this.db, this.collectionName, id));
            return { mensaje: 'Usuario eliminado' }; // Mensaje de éxito
        } catch (error) {
            throw new Error('Error al eliminar el usuario: ' + error.message); // Manejo de errores
        }
    }
}

module.exports = new UsuariosManager(); // Exporta una instancia de la clase
