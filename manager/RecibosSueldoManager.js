const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const db = getFirestore();
const storage = getStorage();

// Función para crear un recibo de sueldo para un encargado específico con un archivo
const crearReciboSueldo = async (encargadoId, reciboData, file) => {
    try {
        // Si hay un archivo, subimos a Firebase Storage
        let fileURL = null;
        if (file) {
            const fileRef = ref(storage, `recibosSueldo/${Date.now()}-${file.originalname}`);
            const uploadTask = uploadBytesResumable(fileRef, file.buffer);

            // Esperar a que la carga termine y obtener la URL del archivo
            await uploadTask;
            fileURL = await getDownloadURL(fileRef);
        }

        // Crear el recibo en Firestore
        const nuevoRecibo = {
            encargadoId, // Asocia el recibo al ID del encargado
            mes: reciboData.mes,
            año: reciboData.año,
            monto: reciboData.monto,
            detalles: reciboData.detalles, // Detalles adicionales del recibo, como bonos, descuentos, etc.
            archivoURL: fileURL, // Guardamos la URL del archivo subido
        };

        const docRef = await addDoc(collection(db, 'recibosSueldo'), nuevoRecibo);
        console.log("Recibo de sueldo creado con ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error al crear el recibo de sueldo: ", error);
        throw new Error('No se pudo crear el recibo de sueldo');
    }
};

// Función para obtener todos los recibos de sueldo de un encargado específico
const obtenerRecibosPorEncargadoId = async (encargadoId) => {
    try {
        const recibosRef = collection(db, 'recibosSueldo');
        const q = query(recibosRef, where("encargadoId", "==", encargadoId));
        const querySnapshot = await getDocs(q);
        const recibos = [];
        querySnapshot.forEach((doc) => {
            recibos.push({ id: doc.id, ...doc.data() });
        });
        return recibos;
    } catch (error) {
        console.error("Error al obtener los recibos de sueldo: ", error);
        throw new Error('No se pudo obtener los recibos de sueldo');
    }
};

module.exports = {
    crearReciboSueldo,
    obtenerRecibosPorEncargadoId,
};
