const express = require("express"); // Framework web
const router = express.Router(); // Router para manejar las rutas de usuarios
const { traerUsuarios, traerUsuario, crearUsuario, actualizarUsuario, borrarUsuario, obtenerEstadisticas } = require("../controllers/usuario.controller.js"); // CRUD de usuarios
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

// Todo privado
router.get("/", verificarTokenMiddleware, verificarRol(['root']), traerUsuarios);
router.get("/estadisticas", verificarTokenMiddleware, verificarRol(['root']), obtenerEstadisticas);
router.get("/:id", verificarTokenMiddleware, verificarRol(['root']), traerUsuario);
router.post("/", verificarTokenMiddleware, verificarRol(['root']), crearUsuario);
router.put("/:id", verificarTokenMiddleware, verificarRol(['root']), actualizarUsuario);
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarUsuario);

module.exports = router;