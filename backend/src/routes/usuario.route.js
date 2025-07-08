/**
 * @fileoverview Rutas para la gestión de usuarios en Pick&Play.
 * Solo accesibles para usuarios con rol 'root'. Permite operaciones CRUD y consulta de estadísticas de usuarios.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */
const express = require("express");
const router = express.Router();
const {
    traerUsuarios,
    traerUsuario,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario,
    obtenerEstadisticas
} = require("../controllers/usuario.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

/**
 * Lista todos los usuarios.
 * @route GET /usuario
 * @returns {Array<Object>} Usuarios registrados
 */
router.get("/", verificarTokenMiddleware, verificarRol(['root']), traerUsuarios);

/**
 * Obtiene estadísticas generales de usuarios.
 * @route GET /usuario/estadisticas
 * @returns {Object} Estadísticas de usuarios
 */
router.get("/estadisticas", verificarTokenMiddleware, verificarRol(['root']), obtenerEstadisticas);

/**
 * Obtiene un usuario por ID.
 * @route GET /usuario/:id
 * @param {string} id - ID del usuario
 * @returns {Object} Usuario encontrado
 */
router.get("/:id", verificarTokenMiddleware, verificarRol(['root']), traerUsuario);

/**
 * Crea un nuevo usuario.
 * @route POST /usuario
 * @returns {Object} Usuario creado
 */
router.post("/", verificarTokenMiddleware, verificarRol(['root']), crearUsuario);

/**
 * Actualiza un usuario existente.
 * @route PUT /usuario/:id
 * @param {string} id - ID del usuario
 * @returns {Object} Usuario actualizado
 */
router.put("/:id", verificarTokenMiddleware, verificarRol(['root']), actualizarUsuario);

/**
 * Elimina un usuario.
 * @route DELETE /usuario/:id
 * @param {string} id - ID del usuario
 * @returns {Object} Resultado de la eliminación
 */
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarUsuario);

module.exports = router;