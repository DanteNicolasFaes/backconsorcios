const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const db = getFirestore();

// Función para crear un nuevo encargado
const crearEncargado = async (encargadoData) => {
    try {
        const nuevoEncargado = {
            nombre: encargadoData.nombre,
            fechaNacimiento: encargadoData.fechaNacimiento,
            cuil: encargadoData.cuil,
            cargo: encargadoData.cargo,
            categoriaEncargado: encargadoData.categoriaEncargado,
            antiguedad: encargadoData.antiguedad, // Años de antigüedad o fecha de inicio de actividades
            recibosSueldo: [], // Para almacenar los recibos de sueldo relacionados
        };
        const docRef = await addDoc(collection(db, 'encargados'), nuevoEncargado);
        console.log("Encargado creado con ID: ", docRef.id);
        return docRef.id; // Devolvemos el ID del encargado recién creado
    } catch (error) {
        console.error("Error al crear el encargado: ", error);
        throw new Error('No se pudo crear el encargado');
    }
};

// Función para obtener todos los encargados
const obtenerEncargados = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'encargados'));
        const encargados = [];
        querySnapshot.forEach((doc) => {
            encargados.push({ id: doc.id, ...doc.data() });
        });
        return encargados;
    } catch (error) {
        console.error("Error al obtener los encargados: ", error);
        throw new Error('No se pudo obtener la lista de encargados');
    }
};

// Función para obtener un encargado por su ID
const obtenerEncargadoPorId = async (id) => {
    try {
        const docRef = doc(db, 'encargados', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error('Encargado no encontrado');
        }
    } catch (error) {
        console.error("Error al obtener el encargado: ", error);
        throw new Error('No se pudo obtener el encargado');
    }
};

// Función para actualizar un encargado
const actualizarEncargado = async (id, encargadoData) => {
    try {
        const docRef = doc(db, 'encargados', id);
        await updateDoc(docRef, {
            nombre: encargadoData.nombre,
            fechaNacimiento: encargadoData.fechaNacimiento,
            cuil: encargadoData.cuil,
            cargo: encargadoData.cargo,
            categoriaEncargado: encargadoData.categoriaEncargado,
            antiguedad: encargadoData.antiguedad, // Años de antigüedad o fecha de inicio de actividades
        });
        console.log("Encargado actualizado con ID: ", id);
    } catch (error) {
        console.error("Error al actualizar el encargado: ", error);
        throw new Error('No se pudo actualizar el encargado');
    }
};

// Función para eliminar un encargado
const eliminarEncargado = async (id) => {
    try {
        const docRef = doc(db, 'encargados', id);
        await deleteDoc(docRef);
        console.log("Encargado eliminado con ID: ", id);
    } catch (error) {
        console.error("Error al eliminar el encargado: ", error);
        throw new Error('No se pudo eliminar el encargado');
    }
};

module.exports = {
    crearEncargado,
    obtenerEncargados,
    obtenerEncargadoPorId,
    actualizarEncargado,
    eliminarEncargado,
};
