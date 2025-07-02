const express = require("express");
const router = express.Router();
const { 
    traerAcciones,
    traerAccion
} = require("../controllers/accion.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

// Rutas para gestión de acciones
router.get("/", verificarTokenMiddleware, verificarRol(['root', 'analista']), traerAcciones);
router.get("/:id", verificarTokenMiddleware, verificarRol(['root', 'analista']), traerAccion);

module.exports = router;