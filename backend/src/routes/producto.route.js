/**
 * @fileoverview Rutas para la gestión de productos en Pick&Play.
 * Permite consultar productos (público) y administrarlos (repositor/root). Incluye carga de imágenes y auditoría.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */
const express = require("express");
const router = express.Router();
const { traerProductos, traerProducto, traerProductosPorCategoria, traerProductosActivos, crearProducto, actualizarProducto, borrarProducto, buscarProductos } = require("../controllers/producto.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");
const auditoriaMiddleware = require("../middlewares/auditoria.middleware.js");
const upload = require("../middlewares/upload.middleware.js");

/**
 * Lista todos los productos.
 * @route GET /producto
 * @returns {Array<Object>} Productos disponibles
 */
router.get("/", traerProductos);

/**
 * Lista productos activos.
 * @route GET /producto/activos
 * @returns {Array<Object>} Productos activos
 */
router.get("/activos", traerProductosActivos);

/**
 * Busca productos por nombre o descripción.
 * @route GET /producto/buscar
 * @returns {Array<Object>} Resultados de búsqueda
 */
router.get("/buscar", buscarProductos);

/**
 * Lista productos por categoría.
 * @route GET /producto/categoria/:categoriaId
 * @param {string} categoriaId - ID de la categoría
 * @returns {Array<Object>} Productos de la categoría
 */
router.get("/categoria/:categoriaId", traerProductosPorCategoria);

/**
 * Obtiene un producto por ID.
 * @route GET /producto/:id
 * @param {string} id - ID del producto
 * @returns {Object} Producto encontrado
 */
router.get("/:id", traerProducto);

/**
 * Crea un nuevo producto (repositor/root).
 * @route POST /producto
 * @returns {Object} Producto creado
 */
router.post("/", verificarTokenMiddleware, verificarRol(['repositor', 'root']), auditoriaMiddleware, upload.single('imagen'), crearProducto);

/**
 * Actualiza un producto existente (repositor/root).
 * @route PUT /producto/:id
 * @param {string} id - ID del producto
 * @returns {Object} Producto actualizado
 */
router.put("/:id", verificarTokenMiddleware, verificarRol(['repositor', 'root']), auditoriaMiddleware, upload.single('imagen'), actualizarProducto);

/**
 * Elimina un producto (solo root).
 * @route DELETE /producto/:id
 * @param {string} id - ID del producto
 * @returns {Object} Resultado de la eliminación
 */
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarProducto);

module.exports = router;