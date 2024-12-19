import { db } from '../firebaseConfig.js';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

class EncargadoManager {
    // Estructura base del encargado
    static estructurarEncargado(datos) {
        return {
            nombre: datos.nombre || 'Sin nombre',
            fechaNacimiento: datos.fechaNacimiento || null,
            cuil: datos.cuil || 'Sin CUIL',
            cargo: datos.cargo || 'Sin asignar',
            categoriaEncargado: datos.categoriaEncargado || 'Sin categoría',
            antiguedad: datos.antiguedad || 0,
            recibosSueldo: datos.recibosSueldo || [],
        };
    }

    // Crear un nuevo encargado
    async crearEncargado(encargadoData) {
        try {
            const nuevoEncargado = EncargadoManager.estructurarEncargado(encargadoData);
            const docRef = await addDoc(collection(db, 'encargados'), nuevoEncargado);
            return { id: docRef.id, ...nuevoEncargado };
        } catch (error) {
            console.error('Error al crear el encargado:', error);
            throw new Error('No se pudo crear el encargado');
        }
    }

    // Obtener todos los encargados
    async obtenerEncargados() {
        try {
            const encargadosSnapshot = await getDocs(collection(db, 'encargados'));
            return encargadosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error al obtener los encargados:', error);
            throw new Error('No se pudo obtener la lista de encargados');
        }
    }

    // Obtener un encargado por ID
    async obtenerEncargadoPorId(id) {
        try {
            const encargadoDoc = await getDoc(doc(db, 'encargados', id));
            if (!encargadoDoc.exists()) throw new Error('Encargado no encontrado');
            return { id: encargadoDoc.id, ...encargadoDoc.data() };
        } catch (error) {
            console.error('Error al obtener el encargado:', error);
            throw new Error('No se pudo obtener el encargado');
        }
    }

    // Actualizar un encargado
    async actualizarEncargado(id, encargadoData) {
        try {
            const encargadoRef = doc(db, 'encargados', id);
            const datosActualizados = EncargadoManager.estructurarEncargado(encargadoData);
            await updateDoc(encargadoRef, datosActualizados);
            return { id, ...datosActualizados };
        } catch (error) {
            console.error('Error al actualizar el encargado:', error);
            throw new Error('No se pudo actualizar el encargado');
        }
    }

    // Eliminar un encargado
    async eliminarEncargado(id) {
        try {
            const encargadoRef = doc(db, 'encargados', id);
            await deleteDoc(encargadoRef);
            return { mensaje: 'Encargado eliminado con éxito' };
        } catch (error) {
            console.error('Error al eliminar el encargado:', error);
            throw new Error('No se pudo eliminar el encargado');
        }
    }
}

export default new EncargadoManager();
