import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno desde un archivo .env

const authenticateUser = (req, res, next) => {
    // Obtiene el token de la cabecera 'Authorization'
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Verifica si se proporcionó un token
    if (!token) {
        return res.status(401).json({ mensaje: 'No se proporcionó un token de autenticación.' });
    }

    try {
        // Verifica el token y extrae la información del usuario
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Lee la clave secreta desde .env
        req.user = decoded; // Almacena la información del usuario en req.user

        // Asegúrate de que isAdmin esté presente
        req.user.isAdmin = req.user.isAdmin || false; // Usa un valor predeterminado si no está presente

        next(); // Continúa con la siguiente función
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
    }
};

export default authenticateUser;