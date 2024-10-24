// /manager/UsuariosManager.js
const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const admin = require('firebase-admin');
const EmailManager = require('./EmailManager');

class UsuariosManager {
    constructor() {
        this.db = getFirestore();
        this.collectionName = 'usuarios'; 
    }

    // Método para crear un nuevo usuario
    async crearUsuario(data, esAdmin, archivo) {
        if (!esAdmin) {
            throw new Error('Acceso no autorizado');
        }

        try {
            const nuevoUsuario = await addDoc(collection(this.db, this.collectionName), {
                ...data,
                archivoUrl: archivo ? archivo.path : null,
                isAdmin: data.isAdmin || false // Guardar si es administrador
            });

            await EmailManager.enviarCorreo(data.email, 'Bienvenido/a', `Hola ${data.nombre}, tu cuenta ha sido creada exitosamente.`);

            return { id: nuevoUsuario.id, ...data, archivoUrl: archivo ? archivo.path : null }; 
        } catch (error) {
            throw new Error('Error al crear el usuario: ' + error.message);
        }
    }

    // Método para obtener todos los usuarios
    async obtenerUsuarios() {
        try {
            const usuariosSnapshot = await getDocs(collection(this.db, this.collectionName));
            return usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
        } catch (error) {
            throw new Error('Error al obtener los usuarios: ' + error.message);
        }
    }

    // Método para obtener un usuario por su ID
    async obtenerUsuarioPorId(id) {
        try {
            const usuarioDoc = await getDoc(doc(this.db, this.collectionName, id));
            if (!usuarioDoc.exists()) {
                throw new Error('Usuario no encontrado');
            }
            return { id: usuarioDoc.id, ...usuarioDoc.data() }; 
        } catch (error) {
            throw new Error('Error al obtener el usuario: ' + error.message);
        }
    }

    // Método para actualizar la información de un usuario
    async actualizarUsuario(id, data, esAdmin, archivo) {
        if (!esAdmin) {
            throw new Error('Acceso no autorizado');
        }

        try {
            await updateDoc(doc(this.db, this.collectionName, id), {
                ...data,
                archivoUrl: archivo ? archivo.path : null
            });

            await EmailManager.enviarCorreo(data.email, 'Actualización de Cuenta', `Hola ${data.nombre}, tu cuenta ha sido actualizada.`);

            return { id, ...data, archivoUrl: archivo ? archivo.path : null }; 
        } catch (error) {
            throw new Error('Error al actualizar el usuario: ' + error.message);
        }
    }

    // Método para eliminar un usuario
    async eliminarUsuario(id, esAdmin) {
        if (!esAdmin) {
            throw new Error('Acceso no autorizado');
        }

        try {
            await deleteDoc(doc(this.db, this.collectionName, id));
            return { mensaje: 'Usuario eliminado' }; 
        } catch (error) {
            throw new Error('Error al eliminar el usuario: ' + error.message);
        }
    }

    // Método para obtener el administrador
    async obtenerAdministrador() {
        try {
            const usuariosSnapshot = await getDocs(collection(this.db, this.collectionName));

            const administrador = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .find(usuario => usuario.isAdmin); // Filtra por isAdmin

            if (!administrador) {
                throw new Error('Administrador no encontrado');
            }

            return administrador; 
        } catch (error) {
            throw new Error('Error al obtener el administrador: ' + error.message);
        }
    }
}

module.exports = new UsuariosManager();
