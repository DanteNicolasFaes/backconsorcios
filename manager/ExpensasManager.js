import { db } from '../firebaseConfig.js';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { obtenerConfiguracion, crearOActualizarConfiguracion } from './ConfiguracionFinancieraManager.js'; // Asegúrate de que el nombre del archivo sea correcto
import { storage } from '../firebaseConfig.js'; // Importar configuración de almacenamiento
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Métodos para subir y obtener URL de los archivos

class ExpensasManager {
    // Método para crear una nueva expensa con manejo de archivos
    async crearExpensa(expensaData, archivo) {
        let archivoUrl = null;
        
        // Si se sube un archivo, lo subimos a Firebase Storage
        if (archivo) {
            const archivoRef = ref(storage, `expensas/${archivo.originalname}`);
            await uploadBytes(archivoRef, archivo.buffer); // Subir el archivo
            archivoUrl = await getDownloadURL(archivoRef); // Obtener la URL del archivo subido
        }

        // Crear la nueva expensa
        const nuevaExpensa = await addDoc(collection(db, 'expensas'), { ...expensaData, archivoUrl });
        return { id: nuevaExpensa.id, ...expensaData, archivoUrl };
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
    async actualizarExpensa(expensaId, expensaData, archivo) {
        const expensaRef = doc(db, 'expensas', expensaId);
        
        let archivoUrl = expensaData.archivoUrl;
        // Si se sube un archivo nuevo, subimos el archivo a Firebase Storage
        if (archivo) {
            const archivoRef = ref(storage, `expensas/${archivo.originalname}`);
            await uploadBytes(archivoRef, archivo.buffer);
            archivoUrl = await getDownloadURL(archivoRef);
        }

        // Actualizar la expensa con los nuevos datos
        await updateDoc(expensaRef, { ...expensaData, archivoUrl });
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
