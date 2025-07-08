/**
 * @fileoverview Rutas para la gestión y consulta de logs de auditoría en Pick&Play.
 * Acceso restringido a usuarios con rol 'analista' o 'root'.
 * Permite obtener logs, estadísticas y resúmenes de auditoría.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */
const express = require("express");
const router = express.Router();
const {
    obtenerLogs,
    obtenerEstadisticas,
    obtenerLogsPorUsuario,
    obtenerLogsPorProducto,
    obtenerResumen
} = require("../controllers/auditoria.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

/**
 * Obtiene todos los logs de auditoría.
 * @route GET /auditoria
 * @returns {Array<Object>} Lista de logs
 */
router.get("/", verificarTokenMiddleware, verificarRol(['analista', 'root']), obtenerLogs);

/**
 * Obtiene estadísticas generales de auditoría.
 * @route GET /auditoria/estadisticas
 * @returns {Object} Estadísticas de auditoría
 */
router.get("/estadisticas", verificarTokenMiddleware, verificarRol(['analista', 'root']), obtenerEstadisticas);

/**
 * Obtiene un resumen general de auditoría.
 * @route GET /auditoria/resumen
 * @returns {Object} Resumen de auditoría
 */
router.get("/resumen", verificarTokenMiddleware, verificarRol(['analista', 'root']), obtenerResumen);

/**
 * Obtiene logs filtrados por usuario.
 * @route GET /auditoria/usuario/:userId
 * @param {string} userId - ID del usuario
 * @returns {Array<Object>} Logs del usuario
 */
router.get("/usuario/:userId", verificarTokenMiddleware, verificarRol(['analista', 'root']), obtenerLogsPorUsuario);

/**
 * Obtiene logs filtrados por producto.
 * @route GET /auditoria/producto/:productId
 * @param {string} productId - ID del producto
 * @returns {Array<Object>} Logs del producto
 */
router.get("/producto/:productId", verificarTokenMiddleware, verificarRol(['analista', 'root']), obtenerLogsPorProducto);

module.exports = router;