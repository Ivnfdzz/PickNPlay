/**
 * @fileoverview Rutas para la gestión de pedidos en Pick&Play.
 * Permite crear y consultar pedidos (público) y administrarlos (analista/root).
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */
const express = require("express");
const router = express.Router();
const { traerPedidos, traerPedido, crearPedido, borrarPedido } = require("../controllers/pedido.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

/**
 * Crea un nuevo pedido (público).
 * @route POST /pedido
 * @returns {Object} Pedido creado
 */
router.post("/", crearPedido);

/**
 * Obtiene un pedido por ID (público).
 * @route GET /pedido/:id
 * @param {string} id - ID del pedido
 * @returns {Object} Pedido encontrado
 */
router.get("/:id", traerPedido);

/**
 * Lista todos los pedidos (analista/root).
 * @route GET /pedido
 * @returns {Array<Object>} Pedidos registrados
 */
router.get("/", verificarTokenMiddleware, verificarRol(['analista', 'root']), traerPedidos);

/**
 * Elimina un pedido (solo root).
 * @route DELETE /pedido/:id
 * @param {string} id - ID del pedido
 * @returns {Object} Resultado de la eliminación
 */
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarPedido);

module.exports = router;