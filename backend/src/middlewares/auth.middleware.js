const AuthService = require('../services/auth.service.js');
const Usuario = require('../models/usuario.model.js');
const Rol = require('../models/rol.model.js');

const verificarTokenMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        const decoded = AuthService.verificarToken(token);

        const usuario = await Usuario.findByPk(decoded.id_usuario);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};

const verificarRol = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.usuario) {
                return res.status(401).json({ 
                    message: 'Token requerido antes de verificar rol' 
                });
            }

            const usuario = await Usuario.findByPk(req.usuario.id_usuario, {
                include: [
                    {
                        model: Rol,
                        attributes: ['nombre']
                    }
                ]
            });

            if(!usuario) {
                return res.status(404).json({ 
                    message: 'Usuario no encontrado' 
                });
            }

            if (!roles.includes(usuario.Rol.nombre)) {
                return res.status(403).json({ 
                    message: 'Acceso denegado: Rol no autorizado' 
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    };
};

module.exports = {
    verificarTokenMiddleware,
    verificarRol
}