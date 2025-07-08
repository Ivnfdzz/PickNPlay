/**
 * @fileoverview Rutas para la gestión de subcategorías en Pick&Play.
 * Permite consultar subcategorías (público) y administrarlas (solo root).
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */
const express = require("express");
const router = express.Router();
const {
    traerSubcategorias,
    traerSubcategoria,
    traerSubcategoriasPorCategoria,
    crearSubcategoria,
    actualizarSubcategoria,
    borrarSubcategoria
} = require("../controllers/subcategoria.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

/**
 * Lista todas las subcategorías.
 * @route GET /subcategoria
 * @returns {Array<Object>} Subcategorías disponibles
 */
router.get("/", traerSubcategorias);

/**
 * Lista subcategorías por categoría.
 * @route GET /subcategoria/categoria/:categoriaId
 * @param {string} categoriaId - ID de la categoría
 * @returns {Array<Object>} Subcategorías de la categoría
 */
router.get("/categoria/:categoriaId", traerSubcategoriasPorCategoria);

/**
 * Obtiene una subcategoría por ID.
 * @route GET /subcategoria/:id
 * @param {string} id - ID de la subcategoría
 * @returns {Object} Subcategoría encontrada
 */
router.get("/:id", traerSubcategoria);

/**
 * Crea una nueva subcategoría (solo root).
 * @route POST /subcategoria
 * @returns {Object} Subcategoría creada
 */
router.post("/", verificarTokenMiddleware, verificarRol(['root']), crearSubcategoria);

/**
 * Actualiza una subcategoría existente (solo root).
 * @route PUT /subcategoria/:id
 * @param {string} id - ID de la subcategoría
 * @returns {Object} Subcategoría actualizada
 */
router.put("/:id", verificarTokenMiddleware, verificarRol(['root']), actualizarSubcategoria);

/**
 * Elimina una subcategoría (solo root).
 * @route DELETE /subcategoria/:id
 * @param {string} id - ID de la subcategoría
 * @returns {Object} Resultado de la eliminación
 */
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarSubcategoria);

module.exports = router;