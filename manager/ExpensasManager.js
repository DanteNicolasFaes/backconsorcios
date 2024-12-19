import { db } from '../firebaseConfig.js';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { obtenerConfiguracion, crearOActualizarConfiguracion } from './ConfiguracionFinancieraManager.js'; // Asegúrate de que el nombre del archivo sea correcto

class ExpensasManager {
    // Método para crear una nueva expensa
    async crearExpensa(expensaData) {
        const nuevaExpensa = await addDoc(collection(db, 'expensas'), expensaData);
        return { id: nuevaExpensa.id, ...expensaData };
    }

    // Método para obtener todas las expensas
    async obtenerExpensas() {
        const expensasSnapshot = await getDocs(collection(db, 'expensas'));
        return expensasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Método para obtener una expensa por ID
    async obtenerExpensaPorId(expensaId) {
        const expensaDoc = await getDoc(doc(db, 'expensas', expensaId));
        if (expensaDoc.exists()) {
            return { id: expensaDoc.id, ...expensaDoc.data() };
        } else {
            throw new Error('Expensa no encontrada');
        }
    }

    // Método para actualizar una expensa
    async actualizarExpensa(expensaId, expensaData) {
        const expensaRef = doc(db, 'expensas', expensaId);
        await updateDoc(expensaRef, expensaData);
        const expensaActualizada = await getDoc(expensaRef);
        return { id: expensaActualizada.id, ...expensaActualizada.data() };
    }

    // Método para eliminar una expensa
    async eliminarExpensa(expensaId) {
        const expensaRef = doc(db, 'expensas', expensaId);
        await deleteDoc(expensaRef);
        return { mensaje: 'Expensa eliminada con éxito' };
    }
}

export default new ExpensasManager();