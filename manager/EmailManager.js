require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env
const mailer = require('../services/mailer'); // Importar el servicio de correo
const admin = require('firebase-admin'); // Importar Firebase Admin

// Inicializa Firebase Admin con las credenciales adecuadas
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(), // O usa admin.credential.cert(serviceAccount) si tienes un archivo de clave
        databaseURL: process.env.FIREBASE_DATABASE_URL, // Asegúrate de tener esta variable en tu .env
    });
}

const db = admin.firestore(); // Obtener la referencia a Firestore

class EmailManager {
    // Método estático para enviar correos electrónicos
    static async enviarCorreo(destinatario, asunto, mensaje, archivoAdjunto = null) {
        this.validarCorreo(destinatario); // Validar el destinatario

        // Configuración del correo
        const opcionesCorreo = {
            from: process.env.SMTP_USER,
            to: destinatario,
            subject: asunto,
            text: mensaje,
            html: `<p>${mensaje}</p>`,
        };

        if (archivoAdjunto) {
            opcionesCorreo.attachments = [{ path: archivoAdjunto }];
        }

        try {
            // Enviar el correo utilizando el servicio mailer
            await mailer.enviarNotificacionPago(destinatario, {
                monto: 'Monto ejemplo',
                fechaPago: 'Fecha ejemplo',
                estado: 'Estado ejemplo',
                descripcion: 'Descripción ejemplo'
            });

            await this.registrarCorreoEnHistorial(destinatario, asunto); // Registrar el correo enviado
            return { mensaje: 'Correo enviado con éxito' };
        } catch (error) {
            console.error('Error al enviar el correo: ', error);
            throw new Error('Error al enviar el correo: ' + error.message); // Mejorar el mensaje de error
        }
    }

    // Método privado para validar el correo electrónico
    static validarCorreo(destinatario) {
        if (!destinatario || typeof destinatario !== 'string' || !/\S+@\S+\.\S+/.test(destinatario)) {
            throw new Error('El destinatario es obligatorio y debe tener un formato válido.');
        }
    }

    // Método para registrar correos enviados en Firestore
    static async registrarCorreoEnHistorial(destinatario, asunto) {
        try {
            const correoData = {
                destinatario,
                asunto,
                fechaEnvio: admin.firestore.FieldValue.serverTimestamp(),
            };

            await db.collection('correos').add(correoData); // Guardar en la colección 'correos'
            console.log(`Correo registrado en Firestore: ${destinatario}, Asunto: ${asunto}`);
        } catch (error) {
            console.error('Error al registrar el correo en Firestore: ', error);
        }
    }
}

module.exports = EmailManager; // Exportar la clase para su uso en otros módulos
