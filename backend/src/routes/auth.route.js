const express = require("express");
const router = express.Router();
const { signup, login, getProfile, logout } = require("../controllers/auth.controller.js");
const { verificarToken } = require("../middlewares/auth.middleware.js");

// Rutas públicas
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Rutas protegidas
router.get("/1", verificarToken, getProfile);

module.exports = router;