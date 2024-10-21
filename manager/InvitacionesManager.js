// /manager/InvitacionesManager.js
const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const nodemailer = require('nodemailer'); // Importa Nodemailer
const admin = require('firebase-admin'); // Asegúrate de tener configurado Firebase Admin

// Clase para gestionar las invitaciones
class InvitacionesManager {
    constructor() {
        // Inicializa Firestore
        this.db = getFirestore();
        this.collectionName = 'invitaciones'; // Nombre de la colección en Firestore
        
        // Configura el transporte de Nodemailer
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Puedes usar otro servicio como SendGrid o Mailgun
            auth: {
                user: 'tu_correo@gmail.com', // Tu correo electrónico
                pass: 'tu_contraseña', // Tu contraseña (considera usar OAuth2 o un "App Password" para mayor seguridad)
            },
        });
    }

    // Función para crear una nueva invitación
    async crearInvitacion(data) {
        // Validaciones
        // 1. Verificar que el correo esté presente y tenga un formato válido
        if (!data.correo || typeof data.correo !== 'string' || !/\S+@\S+\.\S+/.test(data.correo)) {
            throw new Error('El correo es obligatorio y debe tener un formato válido.');
        }

        // 2. Verificar que el asunto esté presente y sea una cadena de texto
        if (!data.asunto || typeof data.asunto !== 'string') {
            throw new Error('El asunto es obligatorio y debe ser una cadena de texto.');
        }

        // 3. Verificar que el mensaje esté presente y sea una cadena de texto
        if (!data.mensaje || typeof data.mensaje !== 'string') {
            throw new Error('El mensaje es obligatorio y debe ser una cadena de texto.');
        }

        try {
            // Añade un nuevo documento a la colección de invitaciones
            const nuevaInvitacion = await addDoc(collection(this.db, this.collectionName), data);
            // Envía el correo electrónico con la invitación
            await this.enviarInvitacion(data.correo, data.asunto, data.mensaje);
            // Retorna el ID de la nueva invitación junto con los datos
            return { id: nuevaInvitacion.id, ...data };
        } catch (error) {
            // Manejo de errores al crear la invitación
            throw new Error('Error al crear la invitación: ' + error.message);
        }
    }

    // Función para enviar la invitación por correo electrónico
    async enviarInvitacion(correoDestino, asunto, mensaje) {
        // Configura los detalles del correo electrónico
        const mailOptions = {
            from: 'tu_correo@gmail.com', // El correo desde el cual envías
            to: correoDestino, // El correo del destinatario
            subject: asunto, // Asunto del correo
            text: mensaje, // Mensaje del correo
        };

        // Envía el correo
        return new Promise((resolve, reject) => {
            this.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return reject('Error al enviar la invitación: ' + error.message);
                }
                resolve('Invitación enviada: ' + info.response);
            });
        });
    }

    // Función para listar todas las invitaciones
    async listarInvitaciones() {
        try {
            const snapshot = await getDocs(collection(this.db, this.collectionName));
            const invitaciones = [];
            snapshot.forEach(doc => {
                invitaciones.push({ id: doc.id, ...doc.data() });
            });
            return invitaciones;
        } catch (error) {
            throw new Error('Error al listar las invitaciones: ' + error.message);
        }
    }

    // Función para obtener detalles de una invitación específica
    async obtenerInvitacionPorId(id) {
        try {
            const docRef = doc(this.db, this.collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('No se encontró la invitación');
            }
        } catch (error) {
            throw new Error('Error al obtener la invitación: ' + error.message);
        }
    }

    // Función para actualizar una invitación
    async actualizarInvitacion(id, data) {
        try {
            // Validaciones para la actualización
            if (data.correo && (typeof data.correo !== 'string' || !/\S+@\S+\.\S+/.test(data.correo))) {
                throw new Error('El correo es obligatorio y debe tener un formato válido.');
            }

            if (data.asunto && typeof data.asunto !== 'string') {
                throw new Error('El asunto debe ser una cadena de texto.');
            }

            if (data.mensaje && typeof data.mensaje !== 'string') {
                throw new Error('El mensaje debe ser una cadena de texto.');
            }

            const docRef = doc(this.db, this.collectionName, id);
            await updateDoc(docRef, data);
            return { id, ...data }; // Retorna el ID y los nuevos datos
        } catch (error) {
            throw new Error('Error al actualizar la invitación: ' + error.message);
        }
    }

    // Función para eliminar una invitación
    async eliminarInvitacion(id) {
        try {
            const docRef = doc(this.db, this.collectionName, id);
            await deleteDoc(docRef);
            return { mensaje: 'Invitación eliminada con éxito' };
        } catch (error) {
            throw new Error('Error al eliminar la invitación: ' + error.message);
        }
    }
}

// Exporta una instancia de la clase InvitacionesManager
module.exports = new InvitacionesManager();
