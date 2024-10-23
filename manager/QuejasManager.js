const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore'); // Importar funciones de Firestore
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage'); // Importar funciones de Firebase Storage
const db = getFirestore(); // Inicializar Firestore
const storage = getStorage(); // Inicializar Storage

class QuejasManager {
    // Método para crear una nueva queja
    static async crearQueja(queja, archivo, unidadFuncionalId, esPropietario) {
        // Validaciones
        // 1. Verificar que el contenido de la queja esté presente y sea una cadena de texto
        if (!queja.contenido || typeof queja.contenido !== 'string') {
            throw new Error('El contenido de la queja es obligatorio y debe ser una cadena de texto.');
        }

        // 2. Verificar que el ID de la unidad funcional esté presente
        if (!unidadFuncionalId) {
            throw new Error('El ID de la unidad funcional es obligatorio.');
        }

        // 3. Validación: solo el propietario o inquilino puede crear una queja
        if (!esPropietario) {
            throw new Error('Acceso no autorizado'); // Error si no es propietario o inquilino
        }

        // Intentar crear una nueva queja en la base de datos
        try {
            let archivoUrl = null; // Variable para almacenar la URL del archivo

            // Si se proporciona un archivo, subirlo a Firebase Storage
            if (archivo) {
                const archivoRef = ref(storage, `quejas/${archivo.originalname}`); // Usar `originalname` para conservar el nombre del archivo
                await uploadBytes(archivoRef, archivo.buffer); // Subir el archivo
                archivoUrl = await getDownloadURL(archivoRef); // Obtener la URL del archivo
            }

            // Crear la queja en Firestore
            const nuevaQuejaRef = await addDoc(collection(db, 'quejas'), {
                contenido: queja.contenido,                 // Contenido de la queja
                unidadFuncionalId: unidadFuncionalId,       // ID de la unidad funcional asociada
                estado: 'abierta',                           // Estado inicial de la queja
                fechaCreacion: new Date().toISOString(),    // Fecha de creación de la queja
                archivoUrl: archivoUrl                       // URL del archivo, si se subió
            });

            // Retornar la queja registrada con su ID
            return { id: nuevaQuejaRef.id, ...queja, estado: 'abierta', archivoUrl };
        } catch (error) {
            // Lanzar error si hay problemas al registrar la queja en la base de datos
            throw new Error('Error al crear la queja: ' + error.message);
        }
    }

    // Método para listar todas las quejas
    static async obtenerQuejas() {
        try {
            const snapshot = await getDocs(collection(db, 'quejas')); // Obtener todas las quejas de la colección 'quejas'
            const quejas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Mapear las quejas a un formato más manejable
            return quejas; // Retornar la lista de quejas
        } catch (error) {
            throw new Error('Error al listar las quejas: ' + error.message);
        }
    }

    // Método para obtener una queja específica por ID
    static async obtenerQuejaPorId(id) {
        try {
            const quejaRef = doc(db, 'quejas', id); // Referencia a la queja específica
            const quejaSnap = await getDoc(quejaRef); // Obtener la queja
            if (!quejaSnap.exists()) {
                throw new Error('Queja no encontrada'); // Error si la queja no existe
            }
            return { id: quejaSnap.id, ...quejaSnap.data() }; // Retornar la queja encontrada
        } catch (error) {
            throw new Error('Error al obtener la queja: ' + error.message);
        }
    }

    // Método para que el administrador responda a una queja
    static async responderQueja(id, respuesta, esAdmin) {
        // Validación: solo el administrador puede responder a una queja
        if (!esAdmin) {
            throw new Error('Acceso no autorizado'); // Error si no es administrador
        }

        try {
            const quejaRef = doc(db, 'quejas', id); // Referencia a la queja a responder
            await updateDoc(quejaRef, { respuesta: respuesta }); // Agregar la respuesta a la queja
            return { message: 'Respuesta añadida a la queja con éxito' }; // Mensaje de éxito
        } catch (error) {
            throw new Error('Error al responder a la queja: ' + error.message); // Manejo de errores
        }
    }

    // Método para eliminar una queja (solo para administradores)
    static async eliminarQueja(id, esAdmin) {
        // Validación: solo el administrador puede eliminar una queja
        if (!esAdmin) {
            throw new Error('Acceso no autorizado'); // Error si no es administrador
        }

        try {
            const quejaRef = doc(db, 'quejas', id); // Referencia a la queja a eliminar
            await deleteDoc(quejaRef); // Eliminar la queja
            return { message: 'Queja eliminada con éxito' }; // Mensaje de éxito
        } catch (error) {
            throw new Error('Error al eliminar la queja: ' + error.message); // Manejo de errores
        }
    }
}

module.exports = QuejasManager; // Exportar la clase para usarla en otros módulos
