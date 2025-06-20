const Rol = require('./rolModel');
const Usuario = require('./usuarioModel');
const Pedido = require('./pedidoModel');
const DetallePedido = require('./detallePedidoModel');
const Producto = require('./productoModel');
const Categoria = require('./categoriaModel');
const Venta = require('./ventaModel');

const establecerRelaciones = () => {
    // Asociaciones Rol-Usuario
    Rol.hasMany(Usuario, { foreignKey: 'id_rol' });
    Usuario.belongsTo(Rol, { foreignKey: 'id_rol' });

    // Asociaciones Pedido-DetallePedido
    Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido' });
    DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });

    // Asociaciones Pedido-Venta
    Pedido.hasOne(Venta, { foreignKey: 'id_pedido' });
    Venta.belongsTo(Pedido, { foreignKey: 'id_pedido' });

    // Asociaciones Producto-DetallePedido
    Producto.hasMany(DetallePedido, { foreignKey: 'id_producto' });
    DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto' });

    // Asociaciones Categoria-Producto
    Categoria.hasMany(Producto, { foreignKey: 'id_categoria' });
    Producto.belongsTo(Categoria, { foreignKey: 'id_categoria' });
};

module.exports = establecerRelaciones;