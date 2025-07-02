const express = require("express");
const router = express.Router();
const { traerSubcategorias, traerSubcategoria, traerSubcategoriasPorCategoria, crearSubcategoria, actualizarSubcategoria, borrarSubcategoria } = require("../controllers/subcategoria.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

// PUBLIC
router.get("/", traerSubcategorias);
router.get("/categoria/:categoriaId", traerSubcategoriasPorCategoria);
router.get("/:id", traerSubcategoria);

// PRIVATE
router.post("/", verificarTokenMiddleware, verificarRol(['root']), crearSubcategoria);
router.put("/:id", verificarTokenMiddleware, verificarRol(['root']), actualizarSubcategoria);
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarSubcategoria);

module.exports = router;