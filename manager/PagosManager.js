import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; 
import { db, storage } from '../firebaseConfig.js'; 
import { collection, addDoc, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';

class PagosManager {
    // Registrar un pago y subir el archivo
    static async registrarPago(pago, archivo, esAdmin) {
        // Solo el administrador puede registrar un pago
        this.validarAcceso(esAdmin);

        this.validarPago(pago); // Validaciones

        if (!archivo) {
            throw new Error('El archivo es obligatorio para registrar el pago.');
        }

        try {
            // Subir archivo a Firebase Storage
            const archivoRef = ref(storage, `pagos/${archivo.originalname}`);
            const uploadTask = uploadBytesResumable(archivoRef, archivo.buffer);

            // Esperar a que el archivo se suba y obtener la URL
            const snapshot = await uploadTask;
            const archivoUrl = await getDownloadURL(snapshot.ref);

            // Registrar el pago en Firestore
            const nuevoPagoRef = await addDoc(collection(db, 'pagos'), {
                idUnidadFuncional: pago.idUnidadFuncional,
                monto: pago.monto,
                fechaPago: pago.fechaPago,
                estado: pago.estado,
                descripcion: pago.descripcion || '',
                archivoUrl: archivoUrl // Guardamos la URL del archivo en lugar de solo el nombre
            });

            // Retornar el pago con la URL del archivo
            return { id: nuevoPagoRef.id, ...pago, archivoUrl: archivoUrl };
        } catch (error) {
            throw new Error(`Error al registrar el pago: ${error.message}`);
        }
    }

    // Obtener un pago por ID
    static async obtenerPagoPorId(id) {
        try {
            const pagoRef = doc(db, 'pagos', id);
            const pagoSnap = await getDoc(pagoRef);
            if (!pagoSnap.exists()) {
                throw new Error(`Pago con ID ${id} no encontrado en la base de datos.`);
            }
            return { id: pagoSnap.id, ...pagoSnap.data() };
        } catch (error) {
            throw new Error(`Error al obtener el pago: ${error.message}`);
        }
    }

    // Eliminar un pago
    static async eliminarPago(id, esAdmin) {
        // Solo el administrador puede eliminar pagos
        this.validarAcceso(esAdmin);

        try {
            const pagoRef = doc(db, 'pagos', id);
            const pagoSnap = await getDoc(pagoRef);
            if (!pagoSnap.exists()) {
                throw new Error(`Pago con ID ${id} no encontrado. No se puede eliminar.`);
            }
            await deleteDoc(pagoRef);
            return { message: 'Pago eliminado con éxito' };
        } catch (error) {
            throw new Error(`Error al eliminar el pago: ${error.message}`);
        }
    }

    // Listar todos los pagos con URL de los archivos
    static async listarPagos() {
        try {
            const snapshot = await getDocs(collection(db, 'pagos'));
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    archivoUrl: data.archivoUrl || null // Agregar la URL del archivo si existe
                };
            });
        } catch (error) {
            throw new Error(`Error al listar los pagos: ${error.message}`);
        }
    }

    // Validar si el usuario tiene acceso
    static validarAcceso(esAdmin) {
        if (!esAdmin) {
            throw new Error('Acceso denegado. Solo el administrador puede realizar esta acción.');
        }
    }

    // Validar el pago
    static validarPago(pago) {
        if (!pago.idUnidadFuncional || !pago.monto || !pago.fechaPago) {
            throw new Error('Faltan datos obligatorios para el pago.');
        }
    }
}

export default PagosManager;
