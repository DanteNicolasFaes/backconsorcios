// /services/mailer.js
const nodemailer = require('nodemailer'); // Asegúrate de instalar nodemailer con npm

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
    service: 'gmail', // Por ejemplo, Gmail
    auth: {
        user: process.env.EMAIL_USER, // Tu correo electrónico
        pass: process.env.EMAIL_PASS,  // Tu contraseña de correo
    },
});

// Función para enviar notificación de pago
const enviarNotificacionPago = async (email, pago) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Remitente
        to: email, // Destinatario
        subject: 'Notificación de Pago',
        text: `Se ha registrado un nuevo pago:\nMonto: ${pago.monto}\nFecha: ${pago.fechaPago}\nEstado: ${pago.estado}\nDescripción: ${pago.descripcion || 'N/A'}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado con éxito');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('No se pudo enviar el correo');
    }
};

module.exports = { enviarNotificacionPago };
