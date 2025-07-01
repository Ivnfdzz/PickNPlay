const express = require("express");
const router = express.Router();
const { 
    traerAcciones,
    traerAccion
} = require("../controllers/accion.controller.js");

// Rutas para gestión de acciones
router.get("/", traerAcciones);
router.get("/:id", traerAccion);

module.exports = router;