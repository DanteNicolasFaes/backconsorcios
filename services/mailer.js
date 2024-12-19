import nodemailer from 'nodemailer'; // Asegúrate de instalar nodemailer con npm

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
    service: 'gmail', // Por ejemplo, Gmail
    auth: {
        user: process.env.EMAIL_USER, // Tu correo electrónico
        pass: process.env.EMAIL_PASS,  // Tu contraseña de correo
    },
});

// Función para enviar notificación de pago
export const enviarNotificacionPago = async (email, pago) => {
    // Validación de datos de pago
    if (!pago.monto || !pago.fechaPago || !pago.estado) {
        throw new Error('Faltan datos del pago.');
    }

    // Opciones del correo
    const mailOptions = {
        from: process.env.EMAIL_USER, // Remitente
        to: email, // Destinatario
        subject: 'Notificación de Pago',
        html: `
            <h3>Se ha registrado un nuevo pago:</h3>
            <ul>
                <li><strong>Monto:</strong> ${pago.monto}</li>
                <li><strong>Fecha:</strong> ${pago.fechaPago}</li>
                <li><strong>Estado:</strong> ${pago.estado}</li>
                <li><strong>Descripción:</strong> ${pago.descripcion || 'N/A'}</li>
            </ul>
        `,
    };

    try {
        // Enviar el correo
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado con éxito');
    } catch (error) {
        // Capturar error
        console.error('Error al enviar el correo:', error.message);
        throw new Error(`No se pudo enviar el correo: ${error.message}`);
    }
};