import { db, storage } from '../firebaseConfig.js'; // Usa la configuración centralizada de Firebase
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Función para subir el archivo y obtener la URL
const subirArchivo = async (file) => {
    if (!file) return null; // Si no hay archivo, no hacemos nada

    try {
        const fileRef = ref(storage, `recibosSueldo/${Date.now()}-${file.originalname}`);
        const uploadTask = uploadBytesResumable(fileRef, file.buffer);
        
        await uploadTask;
        return await getDownloadURL(fileRef);
    } catch (error) {
        console.error('Error al subir archivo:', error);
        throw new Error('Error al subir el archivo del recibo');
    }
};

// Función para crear el recibo de sueldo
export const crearReciboSueldo = async (encargadoId, reciboData, file) => {
    try {
        const fileURL = await subirArchivo(file); // Subir archivo y obtener URL

        const nuevoRecibo = {
            encargadoId,
            mes: reciboData.mes,
            año: reciboData.año,
            monto: reciboData.monto,
            detalles: reciboData.detalles,
            archivoURL: fileURL,
        };

        const docRef = await addDoc(collection(db, 'recibosSueldo'), nuevoRecibo);
        console.log('Recibo de sueldo creado con ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error al crear el recibo de sueldo:', error);
        throw new Error('No se pudo crear el recibo de sueldo');
    }
};

// Función para obtener los recibos de sueldo de un encargado
export const obtenerRecibosPorEncargadoId = async (encargadoId) => {
    try {
        const recibosRef = collection(db, 'recibosSueldo');
        const q = query(recibosRef, where('encargadoId', '==', encargadoId));
        const querySnapshot = await getDocs(q);
        
        const recibos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return recibos;
    } catch (error) {
        console.error('Error al obtener los recibos de sueldo:', error);
        throw new Error('No se pudo obtener los recibos de sueldo');
    }
};