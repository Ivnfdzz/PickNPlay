const jwt  = require('jsonwebtoken');
const { Usuario } = require('../models/associations.js');
require('dotenv').config();

const verificarToken = async (req, res, next) => {
    try {
        // Extrae el token
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        // Verifica y decodifica el token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Busca al usuario en la base de datos usando el ID del token
        const usuario = await Usuario.findByPk(decoded.id_usuario);

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Adjunta los datos del usuario al request para usar en otros middlewares
        req.usuario = usuario;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token no válido o expirado' });
    }
}

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
    verificarToken,
    verificarRol
}