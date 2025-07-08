const express = require("express");
const app = express();
const cors = require("cors");
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

app.get("/", (req, res) => {
    res.send("¡Esta es la API de Pick&Play!");
});

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

app.listen(PORT, async () => {
    await inicializarDB();
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
