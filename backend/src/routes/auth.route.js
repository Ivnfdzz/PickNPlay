const express = require("express");
const router = express.Router();
const { login, getProfile } = require("../controllers/auth.controller.js");
const { verificarTokenMiddleware } = require("../middlewares/auth.middleware.js");

// Solo login público
router.post("/login", login);

// Perfil protegido
router.get("/profile", verificarTokenMiddleware, getProfile);

module.exports = router;