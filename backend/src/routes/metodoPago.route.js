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


// Rutas públicas (para el checkout)
router.get("/", traerMetodosPago);
router.get("/activos", traerMetodosPagoActivos);
router.get("/:id", traerMetodoPago);

// Rutas administrativas
router.post("/", verificarTokenMiddleware, verificarRol(['root']), crearMetodoPago);
router.put("/:id", verificarTokenMiddleware, verificarRol(['root']), actualizarMetodoPago);
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarMetodoPago);

module.exports = router;