const express = require("express");
const router = express.Router();
const { obtenerLogs,obtenerEstadisticas, obtenerLogsPorUsuario, obtenerLogsPorProducto, obtenerResumen } = require("../controllers/auditoria.controller.js");
const { verificarTokenMiddleware, verificarRol } = require("../middlewares/auth.middleware.js");


router.get("/", verificarTokenMiddleware, verificarRol(['analista', 'root']), obtenerLogs);
router.get("/estadisticas", verificarTokenMiddleware, verificarRol(['analista', 'root']), obtenerEstadisticas);
router.get("/resumen", verificarTokenMiddleware, verificarRol(['analista', 'root']), obtenerResumen);

router.get("/usuario/:userId", verificarTokenMiddleware, verificarRol(['analista', 'root']), obtenerLogsPorUsuario);
router.get("/producto/:productId", verificarTokenMiddleware, verificarRol(['analista', 'root']), obtenerLogsPorProducto);

module.exports = router;