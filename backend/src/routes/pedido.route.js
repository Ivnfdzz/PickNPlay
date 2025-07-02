const express = require("express");
const router = express.Router();
const { traerPedidos, traerPedido, crearPedido, borrarPedido } = require("../controllers/pedido.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

// Rutas publicas
router.post("/", crearPedido);

// Rutas privadas
router.get("/", verificarTokenMiddleware, verificarRol(['analista', 'root']), traerPedidos);
router.get("/:id", verificarTokenMiddleware, verificarRol(['analista', 'root']), traerPedido);
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarPedido);

module.exports = router;