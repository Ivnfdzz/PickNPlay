const express = require("express");
const router = express.Router();
const { traerProductos, traerProducto, traerProductosPorCategoria, traerProductosActivos, crearProducto, actualizarProducto, borrarProducto, buscarProductos } = require("../controllers/producto.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");
const auditoriaMiddleware = require("../middlewares/auditoria.middleware.js");

// Rutas públicas (para el autoservicio)
router.get("/", traerProductos);
router.get("/activos", traerProductosActivos);
router.get("/buscar", buscarProductos);
router.get("/categoria/:categoriaId", traerProductosPorCategoria);
router.get("/:id", traerProducto);

// Rutas administrativas
router.post("/", verificarTokenMiddleware, verificarRol(['repositor', 'root']), auditoriaMiddleware, crearProducto);
router.put("/:id", verificarTokenMiddleware, verificarRol(['repositor', 'root']), auditoriaMiddleware, actualizarProducto);
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarProducto);

module.exports = router;