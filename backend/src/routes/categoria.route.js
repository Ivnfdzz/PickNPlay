const express = require("express"); // Framework web
const router = express.Router(); // Router para manejar las rutas de Categorias
const { traerCategorias, traerCategoria, crearCategoria, actualizarCategoria, borrarCategoria } = require("../controllers/categoria.controller.js"); // CRUD de Categoria
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

// Rutas publicas
router.get("/", traerCategorias);
router.get("/:id", traerCategoria);

// Rutas privadas
router.post("/", verificarTokenMiddleware, verificarRol(['root']), crearCategoria);
router.put("/:id", verificarTokenMiddleware, verificarRol(['root']), actualizarCategoria);
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarCategoria);

module.exports = router;