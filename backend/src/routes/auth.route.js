const express = require("express");
const router = express.Router();
const { signup, login, getProfile } = require("../controllers/auth.controller.js");
const { verificarToken } = require("../middlewares/auth.middleware.js");

// Rutas públicas
router.post("/signup", signup);
router.post("/login", login);

// Rutas protegidas
router.get("/profile", verificarToken, getProfile);

module.exports = router;