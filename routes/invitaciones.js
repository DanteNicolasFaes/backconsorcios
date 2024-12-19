import express from 'express';
import multer from 'multer';
import InvitacionesManager from '../manager/InvitacionesManager.js';
import authenticateUser from '../middleware/authenticatedUser.js'; // Asegúrate de que el nombre del archivo sea correcto
import verifyAdmin from '../middleware/verifyAdmin.js';

// Configuración de Multer para manejar la carga de archivos
const storage = multer.memoryStorage(); // Usamos memoria temporal en lugar de disco
const upload = multer({ storage });

const router = express.Router();

// Ruta para crear una nueva invitación
router.post('/', authenticateUser, verifyAdmin, upload.array('archivos', 10), async (req, res) => { // Permitir hasta 10 archivos
    try {
        const datosInvitacion = {
            ...req.body,
            archivos: req.files // Los archivos subidos (si existen)
        };

        // Crear la invitación en el sistema
        const nuevaInvitacion = await InvitacionesManager.crearInvitacion(datosInvitacion, req.user, req.files);
        
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