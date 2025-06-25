const express = require("express");
const router = express.Router();
const { traerPedidos, traerPedido, crearPedido, actualizarPedido, borrarPedido } = require("../controllers/pedido.controller.js");

router.get("/", traerPedidos);
router.get("/:id", traerPedido);
router.post("/", crearPedido);
router.put("/:id", actualizarPedido);
router.delete("/:id", borrarPedido);

module.exports = router;