/**
 * @fileoverview Rutas para la gestión de roles en Pick&Play.
 * Todas las operaciones son privadas y requieren rol 'root'.
 * Permite listar, crear, actualizar y eliminar roles.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */
const express = require("express");
const router = express.Router();
const {
    traerRoles,
    traerRol,
    crearRol,
    actualizarRol,
    borrarRol
} = require("../controllers/rol.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

/**
 * Lista todos los roles.
 * @route GET /rol
 * @returns {Array<Object>} Roles disponibles
 */
router.get("/", verificarTokenMiddleware, verificarRol(['root']), traerRoles);

/**
 * Obtiene un rol por ID.
 * @route GET /rol/:id
 * @param {string} id - ID del rol
 * @returns {Object} Rol encontrado
 */
router.get("/:id", verificarTokenMiddleware, verificarRol(['root']), traerRol);

/**
 * Crea un nuevo rol.
 * @route POST /rol
 * @returns {Object} Rol creado
 */
router.post("/", verificarTokenMiddleware, verificarRol(['root']), crearRol);

/**
 * Actualiza un rol existente.
 * @route PUT /rol/:id
 * @param {string} id - ID del rol
 * @returns {Object} Rol actualizado
 */
router.put("/:id", verificarTokenMiddleware, verificarRol(['root']), actualizarRol);

/**
 * Elimina un rol.
 * @route DELETE /rol/:id
 * @param {string} id - ID del rol
 * @returns {Object} Resultado de la eliminación
 */
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarRol);

module.exports = router;