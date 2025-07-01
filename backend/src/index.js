const express = require("express");
const app = express();
const cors = require("cors");
const { inicializarDB } = require('./config/db.config.js');
const rolRouter = require('./routes/rol.route.js');
const categoriaRouter = require('./routes/categoria.route.js');
const usuarioRouter = require('./routes/usuario.route.js');
const productoRouter = require('./routes/producto.route.js');
const pedidoRouter = require('./routes/pedido.route.js');
const authRouter = require('./routes/auth.route.js');
require('dotenv').config();
const PORT = process.env.PORT || 3000; // Si process.env.PORT es undefined, null, o cualquier valor "falsy", se usará el valor 3000

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("¡Hola, mundo!");
});

app.use("/roles", rolRouter);
app.use("/categorias", categoriaRouter);
app.use("/usuarios", usuarioRouter);
app.use("/productos", productoRouter);
app.use("/pedidos", pedidoRouter);
app.use("/auth", authRouter);

app.listen(PORT, async () => {
    await inicializarDB();
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});