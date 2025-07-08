/**
 * @fileoverview Rutas para la gestión de acciones de auditoría en Pick&Play.
 * Acceso restringido a usuarios con rol 'root' o 'analista'.
 * Permite listar y consultar acciones de auditoría.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */
const express = require("express");
const router = express.Router();
const {
    traerAcciones,
    traerAccion
} = require("../controllers/accion.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

/**
 * Lista todas las acciones de auditoría.
 * @route GET /accion
 * @returns {Array<Object>} Acciones de auditoría
 */
router.get("/", verificarTokenMiddleware, verificarRol(['root', 'analista']), traerAcciones);

/**
 * Obtiene una acción de auditoría por ID.
 * @route GET /accion/:id
 * @param {string} id - ID de la acción
 * @returns {Object} Acción encontrada
 */
router.get("/:id", verificarTokenMiddleware, verificarRol(['root', 'analista']), traerAccion);

module.exports = router;