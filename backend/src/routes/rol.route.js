const express = require("express"); // Framework web
const router = express.Router(); // Router para manejar las rutas de roles
const { traerRoles, traerRol, crearRol, actualizarRol, borrarRol } = require("../controllers/rol.controller.js"); // CRUD de roles
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");

// Todo privado
router.get("/", verificarTokenMiddleware, verificarRol(['root']), traerRoles);
router.get("/:id", verificarTokenMiddleware, verificarRol(['root']), traerRol);
router.post("/", verificarTokenMiddleware, verificarRol(['root']), crearRol);
router.put("/:id", verificarTokenMiddleware, verificarRol(['root']), actualizarRol);
router.delete("/:id", verificarTokenMiddleware, verificarRol(['root']), borrarRol);

module.exports = router;