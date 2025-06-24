const express = require("express"); // Framework web
const app = express();              // Inicializa la aplicación
const cors = require("cors");       // Middleware para permitir CORS
const { inicializarDB } = require('./config/db.config.js'); // Conexión a la base de 
const rolRouter = require('./routes/rol.router.js'); // Rutas para los posteos
const categoriaRouter = require('./routes/categoria.router.js'); // Rutas para los posteos
const usuarioRouter = require('./routes/usuario.router.js'); // Rutas para los posteos
require('dotenv').config();
const PORT = process.env.PORT || 3000; // Si process.env.PORT es undefined, null, o cualquier valor "falsy", se usará el valor 3000

app.use(cors());           // Permite peticiones desde otros orígenes (CORS)
app.use(express.json());   // Permite leer datos en formato JSON en las peticiones

app.get("/", (req, res) => {
    res.send("¡Hola, mundo!"); // Respuesta simple para la ruta raíz
});

app.use("/roles", rolRouter);
app.use("/categorias", categoriaRouter);
app.use("/usuarios", usuarioRouter);

app.listen(PORT, async () => {
    await inicializarDB();
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});