import { db } from '../firebaseConfig.js';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

class UsuariosManager {
    // Método para crear un nuevo usuario
    async crearUsuario(usuarioData, usuarioAutenticado) {
        if (!usuarioAutenticado.isAdmin) {
            throw new Error('Acceso denegado. Solo los administradores pueden crear usuarios.');
        }
        // Si hay archivos, incluir las URLs en los datos del usuario
        if (usuarioData.archivos && usuarioData.archivos.length > 0) {
            usuarioData.archivos = usuarioData.archivos.map(url => ({ url }));
        }
        const nuevoUsuario = await addDoc(collection(db, 'usuarios'), usuarioData);
        return { id: nuevoUsuario.id, ...usuarioData };
    }

    // Método para obtener todos los usuarios
    async obtenerUsuarios(usuarioAutenticado) {
        if (!usuarioAutenticado.isAdmin) {
            throw new Error('Acceso denegado. Solo los administradores pueden obtener la lista de usuarios.');
        }
        const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
        return usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Método para obtener un usuario por ID
    async obtenerUsuarioPorId(usuarioId, usuarioAutenticado) {
        if (!usuarioAutenticado.isAdmin) {
            throw new Error('Acceso denegado. Solo los administradores pueden obtener información de usuarios.');
        }
        const usuarioDoc = await getDoc(doc(db, 'usuarios', usuarioId));
        if (usuarioDoc.exists()) {
            return { id: usuarioDoc.id, ...usuarioDoc.data() };
        } else {
            throw new Error('Usuario no encontrado');
        }
    }

    // Método para actualizar un usuario
    async actualizarUsuario(usuarioId, usuarioData, usuarioAutenticado) {
        if (!usuarioAutenticado.isAdmin) {
            throw new Error('Acceso denegado. Solo los administradores pueden actualizar usuarios.');
        }
        // Si hay archivos, incluir las URLs en los datos del usuario
        if (usuarioData.archivos && usuarioData.archivos.length > 0) {
            usuarioData.archivos = usuarioData.archivos.map(url => ({ url }));
        }
        const usuarioRef = doc(db, 'usuarios', usuarioId);
        await updateDoc(usuarioRef, usuarioData);
        const usuarioActualizado = await getDoc(usuarioRef);
        return { id: usuarioActualizado.id, ...usuarioActualizado.data() };
    }

    // Método para eliminar un usuario
    async eliminarUsuario(usuarioId, usuarioAutenticado) {
        if (!usuarioAutenticado.isAdmin) {
            throw new Error('Acceso denegado. Solo los administradores pueden eliminar usuarios.');
        }
        const usuarioRef = doc(db, 'usuarios', usuarioId);
        await deleteDoc(usuarioRef);
        return { mensaje: 'Usuario eliminado con éxito' };
    }
}

export default new UsuariosManager();
