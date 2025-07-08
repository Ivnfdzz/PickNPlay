/**
 * @fileoverview Rutas de autenticación para Pick&Play.
 * Permite el inicio de sesión y la obtención del perfil del usuario autenticado.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */
const express = require("express");
const router = express.Router();
const { login, getProfile } = require("../controllers/auth.controller.js");
const { verificarTokenMiddleware } = require("../middlewares/auth.middleware.js");

/**
 * Ruta para iniciar sesión de usuario.
 * @route POST /login
 * @param {Request} req - Objeto de solicitud HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 * @returns {Object} Token JWT y datos del usuario autenticado
 * @throws {Error} Si las credenciales son inválidas
 * @example
 * // POST /api/auth/login
 * // { "email": "user@mail.com", "password": "1234" }
 */
router.post("/login", login);

/**
 * Ruta para obtener el perfil del usuario autenticado.
 * Protegida por JWT.
 * @route GET /profile
 * @param {Request} req - Objeto de solicitud HTTP (requiere token en headers)
 * @param {Response} res - Objeto de respuesta HTTP
 * @returns {Object} Datos del usuario autenticado
 * @throws {Error} Si el token es inválido o expiró
 * @example
 * // GET /api/auth/profile
 * // Headers: { Authorization: Bearer <token> }
 */
router.get("/profile", verificarTokenMiddleware, getProfile);

module.exports = router;