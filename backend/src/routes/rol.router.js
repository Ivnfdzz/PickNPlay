const express = require("express"); // Framework web
const router = express.Router(); // Router para manejar las rutas de roles
const { traerRoles, traerRol, crearRol, actualizarRol, borrarRol } = require("../controllers/rolController.js"); // CRUD de roles


router.get("/", traerRoles);

router.get("/:id", traerRol);

router.post("/", crearRol);

router.put("/:id", actualizarRol);

router.delete("/:id", borrarRol);

module.exports = router;