// /manager/UsuariosManager.js
const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const admin = require('firebase-admin');
const EmailManager = require('./EmailManager'); // Importamos el EmailManager

class UsuariosManager {
    constructor() {
        // Inicializa Firestore
        this.db = getFirestore();
        this.collectionName = 'usuarios'; // Nombre de la colección en Firestore
    }

    // Método para crear un nuevo usuario
    async crearUsuario(data, esAdmin, archivo) {
        // Validación: solo el administrador puede crear un usuario
        if (!esAdmin) {
            throw new Error('Acceso no autorizado'); // Error si no es administrador
        }

        try {
            const nuevoUsuario = await addDoc(collection(this.db, this.collectionName), {
                ...data,
                archivoUrl: archivo ? archivo.path : null // Guardar la URL del archivo si se subió
            });

            // Enviar correo al nuevo usuario notificando sobre su creación
            await EmailManager.enviarCorreo(data.email, 'Bienvenido/a', `Hola ${data.nombre}, tu cuenta ha sido creada exitosamente.`);

            return { id: nuevoUsuario.id, ...data, archivoUrl: archivo ? archivo.path : null }; // Retorna el nuevo usuario con su ID
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
    async actualizarUsuario(id, data, esAdmin, archivo) {
        // Validación: solo el administrador puede actualizar un usuario
        if (!esAdmin) {
            throw new Error('Acceso no autorizado'); // Error si no es administrador
        }

        try {
            await updateDoc(doc(this.db, this.collectionName, id), {
                ...data,
                archivoUrl: archivo ? archivo.path : null // Actualiza la URL del archivo si se subió
            });

            // Enviar correo al usuario notificando sobre la actualización
            await EmailManager.enviarCorreo(data.email, 'Actualización de Cuenta', `Hola ${data.nombre}, tu cuenta ha sido actualizada.`);

            return { id, ...data, archivoUrl: archivo ? archivo.path : null }; // Retorna el usuario actualizado
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

    // Método para obtener el administrador
    async obtenerAdministrador() {
        try {
            const usuariosSnapshot = await getDocs(collection(this.db, this.collectionName));

            // Suponiendo que el administrador tiene un campo específico, por ejemplo, "rol" que indica si es admin
            const administrador = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .find(usuario => usuario.rol === 'admin'); // Cambia 'rol' y 'admin' según tu implementación

            if (!administrador) {
                throw new Error('Administrador no encontrado');
            }

            return administrador; // Retorna el objeto del administrador
        } catch (error) {
            throw new Error('Error al obtener el administrador: ' + error.message); // Manejo de errores
        }
    }
}

module.exports = new UsuariosManager(); // Exporta una instancia de la clase
