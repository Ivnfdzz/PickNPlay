const express = require("express"); // Framework web
const router = express.Router(); // Router para manejar las rutas de Categorias
const { traerCategorias, traerCategoria, crearCategoria, actualizarCategoria, borrarCategoria } = require("../controllers/categoriaController.js"); // CRUD de Categoria


router.get("/", traerCategorias);

router.get("/:id", traerCategoria);

router.post("/", crearCategoria);

router.put("/:id", actualizarCategoria);

router.delete("/:id", borrarCategoria);

module.exports = router;