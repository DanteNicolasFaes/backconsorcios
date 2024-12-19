import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno desde un archivo .env

// Configuración del transportador de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Función para enviar correos electrónicos
export const enviarCorreo = async (destinatario, asunto, mensaje) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: destinatario,
        subject: asunto,
        text: mensaje
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado con éxito');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('Error al enviar el correo');
    }
};

// Función para enviar notificaciones relacionadas con edificios
export const enviarNotificacionEdificio = async (destinatario, asunto, mensaje) => {
    await enviarCorreo(destinatario, asunto, mensaje);
};