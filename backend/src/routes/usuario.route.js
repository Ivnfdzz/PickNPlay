const express = require("express"); // Framework web
const router = express.Router(); // Router para manejar las rutas de usuarios
const { traerUsuarios, traerUsuario, crearUsuario, actualizarUsuario, borrarUsuario } = require("../controllers/usuario.controller.js"); // CRUD de usuarios


router.get("/", traerUsuarios);

router.get("/:id", traerUsuario);

router.post("/", crearUsuario);

router.put("/:id", actualizarUsuario);

router.delete("/:id", borrarUsuario);

module.exports = router;