const { inicializarDB } = require('../config/db.config.js');
const crearRoles = require('./rol.seed.js');
const crearCategorias = require('./categoria.seed.js');
const crearMetodosPago = require('./metodoPago.seed.js');
const crearProductos = require('./producto.seed.js');
const crearUsuarios = require('./usuario.seed.js');

const ejecutarSeeds = async () => {
    try {
        console.log('Iniciando seeds...');
        
        // Inicializar DB y relaciones
        await inicializarDB();
        
        // Ejecutar seeds en orden (respetando dependencias)
        await crearRoles();
        await crearCategorias();
        await crearMetodosPago();
        await crearProductos();
        await crearUsuarios();
        
        console.log('Seeds ejecutados exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('Error ejecutando seeds:', error);
        process.exit(1);
    }
};

ejecutarSeeds();