const verifyAdmin = (req, res, next) => {
    // Verifica si el usuario es un administrador usando req.user.isAdmin
    if (req.user && req.user.isAdmin) {
        return next(); // El usuario es un administrador, continúa con la siguiente función
    }
    return res.status(403).json({ mensaje: 'Acceso denegado. Solo los administradores pueden realizar esta acción.' });
};

export default verifyAdmin;