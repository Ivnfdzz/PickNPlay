const express = require("express"); // Framework web
const app = express();              // Inicializa la aplicación
const cors = require("cors");       // Middleware para permitir CORS
const { sequelize, testConnection } = require('./config/db.config.js'); // Conexión a la base de datos
require('dotenv').config();

app.use(cors());           // Permite peticiones desde otros orígenes (CORS)
app.use(express.json());   // Permite leer datos en formato JSON en las peticiones

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});




