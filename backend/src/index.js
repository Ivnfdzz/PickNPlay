/**
 * @fileoverview Punto de entrada principal de la API de Pick&Play.
 * Configura y levanta el servidor Express, rutas, middlewares y conexión a la base de datos.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const express = require("express");
const app = express();
const cors = require("cors");
const path = require('path');
const { inicializarDB } = require("./config/db.config.js");
const rolRouter = require("./routes/rol.route.js");
const categoriaRouter = require("./routes/categoria.route.js");
const usuarioRouter = require("./routes/usuario.route.js");
const productoRouter = require("./routes/producto.route.js");
const pedidoRouter = require("./routes/pedido.route.js");
const authRouter = require("./routes/auth.route.js");
const subcategoriaRouter = require("./routes/subcategoria.route.js");
const metodoPagoRouter = require("./routes/metodoPago.route.js");
const accionRouter = require("./routes/accion.route.js");
const logRouter = require("./routes/auditoria.route.js");
require("dotenv").config();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * Ruta raíz de la API para verificación de estado.
 * @route GET /
 * @returns {string} Mensaje de bienvenida.
 */
app.get("/", (req, res) => {
    res.send("¡Esta es la API de Pick&Play!");
});

// Rutas principales de la API
app.use("/api/roles", rolRouter);
app.use("/api/categorias", categoriaRouter);
app.use("/api/subcategorias", subcategoriaRouter);
app.use("/api/usuarios", usuarioRouter);
app.use("/api/productos", productoRouter);
app.use("/api/pedidos", pedidoRouter);
app.use("/api/metodosPago", metodoPagoRouter);
app.use("/api/acciones", accionRouter);
app.use("/api/auth", authRouter);
app.use("/api/auditoria", logRouter);
app.use('/img/productos', express.static(path.join(__dirname, 'img/productos')));

// Inicialización del servidor y la base de datos
app.listen(PORT, async () => {
    await inicializarDB();
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
