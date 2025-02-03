import { db } from '../firebaseConfig.js';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { enviarNotificacionEdificio } from '../services/mailer.js'; // Importar la función para enviar correos
import UsuariosManager from './UsuariosManager.js'; // Importar UsuariosManager si es necesario

class EdificiosManager {
    // Método para crear un nuevo edificio
    async crearEdificio(edificioData, adminEmail) {
        const nuevoEdificio = await addDoc(collection(db, 'edificios'), edificioData);

        // Enviar notificación solo al administrador
        await enviarNotificacionEdificio(adminEmail, 'Nuevo Edificio Creado', 'Se ha creado un nuevo edificio.');

        return { id: nuevoEdificio.id, ...edificioData };
    }

    // Método para obtener todos los edificios
    async obtenerEdificios() {
        const edificiosSnapshot = await getDocs(collection(db, 'edificios'));
        return edificiosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Método para obtener un edificio por ID
    async obtenerEdificioPorId(edificioId) {
        const edificioDoc = await getDoc(doc(db, 'edificios', edificioId));
        if (edificioDoc.exists()) {
            return { id: edificioDoc.id, ...edificioDoc.data() };
        } else {
            throw new Error('Edificio no encontrado');
        }
    }

    // Método para actualizar un edificio
    async actualizarEdificio(edificioId, edificioData) {
        const edificioRef = doc(db, 'edificios', edificioId);
        await updateDoc(edificioRef, edificioData);
        const edificioActualizado = await getDoc(edificioRef);
        return { id: edificioActualizado.id, ...edificioActualizado.data() };
    }

    // Método para eliminar un edificio
    async eliminarEdificio(edificioId) {
        const edificioRef = doc(db, 'edificios', edificioId);
        await deleteDoc(edificioRef);
        return { mensaje: 'Edificio eliminado con éxito' };
    }
}

export default new EdificiosManager();
