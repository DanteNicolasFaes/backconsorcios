// middleware/verifyAdmin.js
const verifyAdmin = (req, res, next) => {
    // Suponiendo que el rol del usuario está almacenado en req.user. 
    // Esto dependerá de cómo hayas manejado la autenticación.
    if (req.user && req.user.role === 'admin') {
        return next(); // El usuario es un administrador, continúa con la siguiente función
    }
    return res.status(403).json({ mensaje: 'Acceso denegado. Solo los administradores pueden realizar esta acción.' });
};

module.exports = verifyAdmin;
