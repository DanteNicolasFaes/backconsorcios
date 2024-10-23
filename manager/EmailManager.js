// EmailManager.js
require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env
const nodemailer = require('nodemailer');

class EmailManager {
    // Método estático para enviar correos electrónicos
    static async enviarCorreo(destinatario, asunto, mensaje) {
        // Configurar el transportador usando las variables de entorno
        const transportador = nodemailer.createTransport({
            host: process.env.SMTP_HOST, // Servidor SMTP (ej. smtp.gmail.com)
            port: process.env.SMTP_PORT || 587, // Puerto SMTP (587 o 465)
            secure: process.env.SMTP_PORT == 465, // true para puerto 465, false para otros puertos
            auth: {
                user: process.env.SMTP_USER, // Usuario del servicio SMTP
                pass: process.env.SMTP_PASS, // Contraseña del servicio SMTP
            },
        });

        // Configuración del correo
        const opcionesCorreo = {
            from: process.env.SMTP_USER, // Remitente (usuario SMTP)
            to: destinatario, // Destinatario del correo
            subject: asunto, // Asunto del correo
            text: mensaje, // Mensaje en texto plano
            html: `<p>${mensaje}</p>`, // Mensaje en HTML
        };

        // Enviar el correo y gestionar errores
        try {
            const info = await transportador.sendMail(opcionesCorreo);
            console.log('Correo enviado: %s', info.messageId);
            return { message: 'Correo enviado con éxito', messageId: info.messageId };
        } catch (error) {
            console.error('Error al enviar el correo: ', error);
            throw new Error('Error al enviar el correo');
        }
    }
}

module.exports = EmailManager; // Exportar la clase para su uso en otros módulos
