const Rol = require('./rol.model');
const Usuario = require('./usuario.model');
const Pedido = require('./pedido.model');
const DetallePedido = require('./detallePedido.model');
const Producto = require('./producto.model');
const Categoria = require('./categoria.model');

const establecerRelaciones = () => {
    // Asociaciones Rol-Usuario
    Rol.hasMany(Usuario, { foreignKey: 'id_rol' });
    Usuario.belongsTo(Rol, { foreignKey: 'id_rol' });

    // Asociaciones Pedido-DetallePedido
    Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido' });
    DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });

    // Asociaciones Producto-DetallePedido
    Producto.hasMany(DetallePedido, { foreignKey: 'id_producto' });
    DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto' });

    // Asociaciones Categoria-Producto
    Categoria.hasMany(Producto, { foreignKey: 'id_categoria' });
    Producto.belongsTo(Categoria, { foreignKey: 'id_categoria' });
};

module.exports = establecerRelaciones;