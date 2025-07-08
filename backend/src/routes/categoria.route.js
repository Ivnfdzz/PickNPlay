/**
 * @fileoverview Rutas para la gestión de categorías en Pick&Play.
 * Permite operaciones CRUD sobre categorías. Solo 'root' puede modificar. Consultas públicas.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */
const express = require("express");
const router = express.Router();
const {
    traerCategorias,
    traerCategoria,
    crearCategoria,
    actualizarCategoria,
    borrarCategoria
} = require("../controllers/categoria.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

/**
 * Lista todas las categorías.
 * @route GET /categorias
 * @returns {Array<Object>} Categorías disponibles
 */
router.get("/", traerCategorias);

/**
 * Obtiene una categoría por ID.
 * @route GET /categorias/:id
 * @param {string} id - ID de la categoría
 * @returns {Object} Categoría encontrada
 */
router.get("/:id", traerCategoria);

/**
 * Crea una nueva categoría (solo root).
 * @route POST /categorias
 * @returns {Object} Categoría creada
 */
router.post("/", verificarTokenMiddleware, verificarRol(['root']), crearCategoria);

/**
 * Actualiza una categoría existente (solo root).
 * @route PUT /categorias/:id
 * @param {string} id - ID de la categoría
 * @returns {Object} Categoría actualizada
 */
router.put("/:id", verificarTokenMiddleware, verificarRol(['root']), actualizarCategoria);

/**
 * Elimina una categoría (solo root).
 * @route DELETE /categorias/:id
 * @param {string} id - ID de la categoría
 * @returns {Object} Resultado de la eliminación
 */
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarCategoria);

module.exports = router;