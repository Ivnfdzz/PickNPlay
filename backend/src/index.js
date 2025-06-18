const express = require("express"); // Framework web
const app = express();              // Inicializa la aplicación
const cors = require("cors");       // Middleware para permitir CORS

const { DB, testConnection } = require('./config/db.config.js'); // Conexión a la base de datos
require('dotenv').config();
const PORT = process.env.PORT || 3000; // Si process.env.PORT es undefined, null, o cualquier valor "falsy", se usará el valor 3000

app.use(cors());           // Permite peticiones desde otros orígenes (CORS)
app.use(express.json());   // Permite leer datos en formato JSON en las peticiones



app.listen(PORT, () => {
    testConnection();
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});