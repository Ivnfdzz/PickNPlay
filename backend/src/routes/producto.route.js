const express = require("express");
const router = express.Router();
const { 
    traerProductos, 
    traerProducto, 
    traerProductosPorCategoria,
    traerProductosActivos,
    crearProducto, 
    actualizarProducto, 
    borrarProducto,
    buscarProductos
} = require("../controllers/producto.controller.js");

// Rutas públicas (para el autoservicio)
router.get("/", traerProductos);
router.get("/activos", traerProductosActivos);
router.get("/buscar", buscarProductos);
router.get("/categoria/:categoriaId", traerProductosPorCategoria);
router.get("/:id", traerProducto);

// Rutas administrativas
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", borrarProducto);

module.exports = router;