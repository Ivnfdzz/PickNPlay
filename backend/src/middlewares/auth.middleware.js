/**
 * @fileoverview Middleware de autenticación y autorización para Pick&Play.
 * Incluye verificación de token JWT y control de acceso por roles.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const AuthService = require('../services/auth.service.js');
const Usuario = require('../models/usuario.model.js');
const Rol = require('../models/rol.model.js');

/**
 * Middleware que verifica la validez del token JWT y adjunta el usuario autenticado a la request.
 * @param {import('express').Request} req - Solicitud HTTP con el token en el header Authorization.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {Function} next - Siguiente middleware.
 * @returns {void} Devuelve error si el token es inválido o el usuario no existe.
 */
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

/**
 * Middleware de autorización por roles. Permite acceso solo a usuarios con roles permitidos.
 * @param {string[]} roles - Array de nombres de roles permitidos.
 * @returns {Function} Middleware de autorización.
 * @example
 * app.get('/ruta', verificarTokenMiddleware, verificarRol(['admin', 'supervisor']), handler)
 */
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