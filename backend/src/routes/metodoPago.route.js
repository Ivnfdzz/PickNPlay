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

// Rutas públicas (para el checkout)
router.get("/", traerMetodosPago);
router.get("/activos", traerMetodosPagoActivos);
router.get("/:id", traerMetodoPago);

// Rutas administrativas
router.post("/", crearMetodoPago);
router.put("/:id", actualizarMetodoPago);
router.delete("/:id", borrarMetodoPago);

module.exports = router;