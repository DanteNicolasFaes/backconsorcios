import express from 'express';
import InvitacionesManager from '../manager/InvitacionesManager.js';
import authenticateUser from '../middleware/authenticatedUser.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import { upload, uploadAndStoreUrls } from '../middleware/upload.js';  // Importar el middleware

const router = express.Router();

// Ruta para crear una nueva invitación
router.post('/', authenticateUser, verifyAdmin, upload, uploadAndStoreUrls, async (req, res) => {
    try {
        const datosInvitacion = {
            ...req.body,
            archivos: req.fileUrls || []  // Si se subieron archivos, guardar las URLs
        };

        // Crear la invitación en el sistema
        const nuevaInvitacion = await InvitacionesManager.crearInvitacion(datosInvitacion, req.user, req.fileUrls);

        // Generar el mensaje con el enlace de registro utilizando el token de la invitación
        const mensaje = `¡Hola! Has recibido una invitación para unirte al software de administración de consorcios. 
                         Por favor, regístrate en el siguiente enlace: https://tuapp.com/registro?invitacion=${nuevaInvitacion.token}`;

        // Enviar la invitación por correo electrónico a los propietarios/inquilinos
        const correos = req.body.correos; // Array de correos electrónicos de los destinatarios
        for (let email of correos) {
            await EmailManager.enviarCorreo(
                email, 
                'Invitación para unirte al software de administración', 
                mensaje
            );
        }

        // Responder con la invitación creada
        res.status(201).json(nuevaInvitacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para listar todas las invitaciones
router.get('/', authenticateUser, async (req, res) => {
    try {
        const invitaciones = await InvitacionesManager.listarInvitaciones();
        res.status(200).json(invitaciones);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener detalles de una invitación específica por ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const invitacion = await InvitacionesManager.obtenerInvitacionPorId(req.params.id);
        res.status(200).json(invitacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

export default router;
