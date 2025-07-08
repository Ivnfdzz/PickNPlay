/**
 * @fileoverview Controlador de autenticación de usuarios para el sistema Pick&Play.
 * Gestiona el login y la obtención del perfil del usuario autenticado.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const AuthService = require('../services/auth.service.js');

/**
 * Realiza la autenticación de un usuario y genera un token JWT si las credenciales son válidas.
 * @param {import('express').Request} req - Objeto de solicitud HTTP con email y password en el body.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @returns {void} Devuelve un JSON con el usuario autenticado y el token.
 * @throws {Error} Si las credenciales son inválidas o faltan datos requeridos.
 * @example
 * // POST /api/auth/login
 * // body: { email: 'user@mail.com', password: '1234' }
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await AuthService.validarCredenciales(email, password);
        const token = AuthService.generarToken(usuario);
        const respuesta = AuthService.formatearRespuestaLogin(usuario, token);
        return res.status(200).json(respuesta);
    } catch (error) {
        if (error.message.includes('requeridos') || 
            error.message.includes('inválido') ||
            error.message.includes('no encontrado') ||
            error.message.includes('incorrecta') ||
            error.message.includes('caracteres')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene el perfil del usuario autenticado a partir del token JWT.
 * @param {import('express').Request} req - Objeto de solicitud HTTP con el usuario autenticado en req.usuario.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @returns {void} Devuelve un JSON con los datos del usuario.
 * @throws {Error} Si el usuario no existe o hay un error de servidor.
 * @example
 * // GET /api/auth/profile
 * // Header: Authorization: Bearer <token>
 */
const getProfile = async (req, res) => {
    try {
        const usuario = await AuthService.obtenerPerfil(req.usuario.id_usuario);
        return res.status(200).json({ usuario });
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    login,
    getProfile
};