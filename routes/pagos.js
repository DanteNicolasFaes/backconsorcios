import express from 'express';
import multer from 'multer';
import PagosManager from '../manager/PagosManager.js';
import authenticateUser from '../middleware/authenticatedUser.js'; // Asegúrate de que el nombre del archivo sea correcto
import verifyAdmin from '../middleware/verifyAdmin.js';

// Configuración de Multer para manejo de archivos
const storage = multer.memoryStorage(); // Usamos memoria temporal en lugar de disco
const upload = multer({ storage });

const router = express.Router();

// Ruta para registrar un nuevo pago
router.post('/registrar', authenticateUser, verifyAdmin, upload.single('archivo'), async (req, res) => {
    const { monto, fechaPago, estado, idUnidadFuncional, descripcion } = req.body;
    const archivo = req.file; // El archivo subido

    // Datos del pago
    const pago = {
        monto: parseFloat(monto),
        fechaPago,
        estado,
        idUnidadFuncional,
        descripcion
    };

    try {
        // Llamar al método de PagosManager para registrar el pago
        const nuevoPago = await PagosManager.registrarPago(pago, archivo, req.user.isAdmin);

        res.status(201).json({
            message: 'Pago registrado exitosamente',
            pago: nuevoPago
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Ruta para listar todos los pagos
router.get('/', authenticateUser, async (req, res) => {
    try {
        const pagos = await PagosManager.listarPagos();
        res.status(200).json(pagos); // Enviar la lista de pagos
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Ruta para obtener un pago por ID
router.get('/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;

    try {
        const pago = await PagosManager.obtenerPagoPorId(id);
        res.status(200).json(pago); // Enviar el pago encontrado
    } catch (error) {
        res.status(404).json({
            error: error.message
        });
    }
});

// Ruta para eliminar un pago
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const respuesta = await PagosManager.eliminarPago(id, req.user.isAdmin);
        res.status(200).json(respuesta); // Enviar mensaje de éxito
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Ruta para actualizar un pago
router.put('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { monto, fechaPago, estado, descripcion, archivo } = req.body;

    const datosActualizados = {
        monto: monto ? parseFloat(monto) : undefined,
        fechaPago,
        estado,
        descripcion,
        archivo // En este caso no estamos utilizando Multer, pero podrías hacerlo si se necesitara
    };

    try {
        const pagoActualizado = await PagosManager.actualizarPago(id, datosActualizados, req.user.isAdmin);
        res.status(200).json({
            message: 'Pago actualizado exitosamente',
            pago: pagoActualizado
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

export default router;