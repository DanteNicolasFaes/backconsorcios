// EmailManager.js
require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env
const nodemailer = require('nodemailer');

class EmailManager {
    // Método estático para enviar correos electrónicos
    static async enviarCorreo(destinatario, asunto, mensaje, archivoAdjunto = null) {
        this.validarCorreo(destinatario); // Validar el destinatario

        const transportador = this.configurarTransportador(); // Configurar el transportador
        const opcionesCorreo = this.crearOpcionesCorreo(destinatario, asunto, mensaje, archivoAdjunto); // Crear opciones del correo

        // Enviar el correo y gestionar errores
        try {
            const info = await transportador.sendMail(opcionesCorreo);
            console.log('Correo enviado: %s', info.messageId);
            return { mensaje: 'Correo enviado con éxito', messageId: info.messageId };
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

    // Método privado para configurar el transportador
    static configurarTransportador() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Método privado para crear las opciones del correo
    static crearOpcionesCorreo(destinatario, asunto, mensaje, archivoAdjunto) {
        const opciones = {
            from: process.env.SMTP_USER,
            to: destinatario,
            subject: asunto,
            text: mensaje,
            html: `<p>${mensaje}</p>`,
        };

        // Añadir archivo adjunto si existe
        if (archivoAdjunto) {
            opciones.attachments = [{ path: archivoAdjunto }];
        }

        return opciones;
    }

    // (Opcional) Método para registrar correos enviados
    static async registrarCorreoEnHistorial(destinatario, asunto) {
        // Aquí puedes implementar lógica para guardar el correo en una base de datos o un archivo de registro
    }
}

module.exports = EmailManager; // Exportar la clase para su uso en otros módulos
