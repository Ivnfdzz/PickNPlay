const express = require("express");
const router = express.Router();
const { traerSubcategorias, traerSubcategoria, traerSubcategoriasPorCategoria, crearSubcategoria, actualizarSubcategoria, borrarSubcategoria } = require("../controllers/subcategoria.controller.js");

// PUBLIC
router.get("/", traerSubcategorias);
router.get("/categoria/:categoriaId", traerSubcategoriasPorCategoria);
router.get("/:id", traerSubcategoria);

// PRIVATE
router.post("/", crearSubcategoria);
router.put("/:id", actualizarSubcategoria);
router.delete("/:id", borrarSubcategoria);

module.exports = router;