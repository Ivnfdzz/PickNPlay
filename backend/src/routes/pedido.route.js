const express = require("express");
const router = express.Router();
const { traerPedidos, traerPedido, crearPedido, borrarPedido } = require("../controllers/pedido.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

// RUTAS PÚBLICAS
router.post("/", crearPedido);
router.get("/:id", traerPedido);

// RUTAS PRIVADAS
router.get("/", verificarTokenMiddleware, verificarRol(['analista', 'root']), traerPedidos);
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarPedido);

module.exports = router;