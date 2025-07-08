/**
 * @fileoverview Rutas para la gestión de métodos de pago en Pick&Play.
 * Permite consultar métodos de pago (público) y administrarlos (solo root).
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */
const express = require("express");
const router = express.Router();
const {
    traerMetodosPago,
    traerMetodoPago,
    traerMetodosPagoActivos,
    crearMetodoPago,
    actualizarMetodoPago,
    borrarMetodoPago
} = require("../controllers/metodoPago.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

/**
 * Lista todos los métodos de pago.
 * @route GET /metodopago
 * @returns {Array<Object>} Métodos de pago
 */
router.get("/", traerMetodosPago);

/**
 * Lista métodos de pago activos.
 * @route GET /metodopago/activos
 * @returns {Array<Object>} Métodos de pago activos
 */
router.get("/activos", traerMetodosPagoActivos);

/**
 * Obtiene un método de pago por ID.
 * @route GET /metodopago/:id
 * @param {string} id - ID del método de pago
 * @returns {Object} Método de pago encontrado
 */
router.get("/:id", traerMetodoPago);

/**
 * Crea un nuevo método de pago (solo root).
 * @route POST /metodopago
 * @returns {Object} Método de pago creado
 */
router.post("/", verificarTokenMiddleware, verificarRol(['root']), crearMetodoPago);

/**
 * Actualiza un método de pago existente (solo root).
 * @route PUT /metodopago/:id
 * @param {string} id - ID del método de pago
 * @returns {Object} Método de pago actualizado
 */
router.put("/:id", verificarTokenMiddleware, verificarRol(['root']), actualizarMetodoPago);

/**
 * Elimina un método de pago (solo root).
 * @route DELETE /metodopago/:id
 * @param {string} id - ID del método de pago
 * @returns {Object} Resultado de la eliminación
 */
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarMetodoPago);

module.exports = router;