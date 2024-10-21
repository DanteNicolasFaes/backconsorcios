// PagosManager.js

const { getFirestore, collection, addDoc, getDocs, doc, getDoc, deleteDoc } = require('firebase/firestore'); // Importar funciones de Firestore
const db = getFirestore(); // Inicializar Firestore

class PagosManager {
    // Método para registrar un nuevo pago
    static async registrarPago(pago) {
        this.validarPago(pago); // Validaciones
        
        try {
            const nuevoPagoRef = await addDoc(collection(db, 'pagos'), {
                idUnidadFuncional: pago.idUnidadFuncional, // ID de la unidad funcional asociada al pago
                monto: pago.monto,                         // Monto del pago
                fechaPago: pago.fechaPago,                 // Fecha en que se realiza el pago
                estado: pago.estado,                       // Estado del pago (ej: "pendiente", "completado")
                descripcion: pago.descripcion || ''         // Descripción opcional del pago
            });

            return { id: nuevoPagoRef.id, ...pago }; // Retornar el pago registrado con su ID
        } catch (error) {
            throw new Error(`Error al registrar el pago: ${error.message}`);
        }
    }

    // Método para listar todos los pagos
    static async listarPagos() {
        try {
            const snapshot = await getDocs(collection(db, 'pagos'));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Retornar la lista de pagos
        } catch (error) {
            throw new Error(`Error al listar los pagos: ${error.message}`);
        }
    }

    // Método para obtener un pago específico por ID
    static async obtenerPagoPorId(id) {
        try {
            const pagoRef = doc(db, 'pagos', id);
            const pagoSnap = await getDoc(pagoRef);
            if (!pagoSnap.exists()) {
                throw new Error('Pago no encontrado');
            }
            return { id: pagoSnap.id, ...pagoSnap.data() }; // Retornar el pago encontrado
        } catch (error) {
            throw new Error(`Error al obtener el pago: ${error.message}`);
        }
    }

    // Método para eliminar un pago
    static async eliminarPago(id) {
        try {
            const pagoRef = doc(db, 'pagos', id);
            await deleteDoc(pagoRef);
            return { message: 'Pago eliminado con éxito' }; // Mensaje de éxito
        } catch (error) {
            throw new Error(`Error al eliminar el pago: ${error.message}`);
        }
    }

    // Método para validar un pago
    static validarPago(pago) {
        // 1. Verificar que el ID de la unidad funcional esté presente y sea una cadena de texto
        if (!pago.idUnidadFuncional || typeof pago.idUnidadFuncional !== 'string') {
            throw new Error('El ID de la unidad funcional es obligatorio y debe ser una cadena de texto.');
        }

        // 2. Verificar que el monto esté presente, sea un número y mayor que cero
        if (!pago.monto || typeof pago.monto !== 'number' || pago.monto <= 0) {
            throw new Error('El monto es obligatorio y debe ser un número mayor que cero.');
        }

        // 3. Verificar que la fecha de pago esté presente y tenga un formato válido
        if (!pago.fechaPago || isNaN(new Date(pago.fechaPago).getTime())) {
            throw new Error('La fecha de pago es obligatoria y debe tener un formato válido.');
        }

        // 4. Verificar que el estado esté presente y sea una cadena de texto
        if (!pago.estado || typeof pago.estado !== 'string') {
            throw new Error('El estado es obligatorio y debe ser una cadena de texto.');
        }
    }
}

module.exports = PagosManager; // Exportar la clase para usarla en otros módulos
