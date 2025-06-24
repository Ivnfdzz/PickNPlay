const Rol = require('./rol.model');
const Usuario = require('./usuario.model');
const Pedido = require('./pedido.model');
const DetallePedido = require('./detallePedido.model');
const Producto = require('./producto.model');
const Categoria = require('./categoria.model');
const Subcategoria = require('./subcategoria.model');
const ProductoSubcategoria = require('./productoSubcategoria.model');
const MetodoPago = require('./metodoPago.model');
const Accion = require('./accion.model');
const LogAccionUsuario = require('./logAccionUsuario.model');

const establecerRelaciones = () => {
    // Rol-Usuario
    Rol.hasMany(Usuario, { foreignKey: 'id_rol' });
    Usuario.belongsTo(Rol, { foreignKey: 'id_rol' });

    // Pedido-DetallePedido
    Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido' });
    DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });

    // Producto-DetallePedido
    Producto.hasMany(DetallePedido, { foreignKey: 'id_producto' });
    DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto' });

    // Categoria-Producto
    Categoria.hasMany(Producto, { foreignKey: 'id_categoria' });
    Producto.belongsTo(Categoria, { foreignKey: 'id_categoria' });

    // MetodoPago-Pedido
    MetodoPago.hasMany(Pedido, { foreignKey: 'id_metodopago' });
    Pedido.belongsTo(MetodoPago, { foreignKey: 'id_metodopago' });

    // Categoria-Subcategoria
    Categoria.hasMany(Subcategoria, { foreignKey: 'id_categoria' });
    Subcategoria.belongsTo(Categoria, { foreignKey: 'id_categoria' });

    // N:M Producto-Subcategoria
    Producto.belongsToMany(Subcategoria, { 
        through: ProductoSubcategoria, 
        foreignKey: 'id_producto',
        otherKey: 'id_subcategoria',
        as: 'subcategorias'
    });

    Subcategoria.belongsToMany(Producto, { 
        through: ProductoSubcategoria, 
        foreignKey: 'id_subcategoria',
        otherKey: 'id_producto',
        as: 'productos'
    });

    // Relaciones intermedias para tabla N:M
    Producto.hasMany(ProductoSubcategoria, { foreignKey: 'id_producto' });
    ProductoSubcategoria.belongsTo(Producto, { foreignKey: 'id_producto' });

    Subcategoria.hasMany(ProductoSubcategoria, { foreignKey: 'id_subcategoria' });
    ProductoSubcategoria.belongsTo(Subcategoria, { foreignKey: 'id_subcategoria' });

    // Sistema de logs (Sin alias, son claros)
    Usuario.hasMany(LogAccionUsuario, { foreignKey: 'id_usuario' });
    LogAccionUsuario.belongsTo(Usuario, { foreignKey: 'id_usuario' });

    Accion.hasMany(LogAccionUsuario, { foreignKey: 'id_accion' });
    LogAccionUsuario.belongsTo(Accion, { foreignKey: 'id_accion' });

    Producto.hasMany(LogAccionUsuario, { foreignKey: 'id_producto' });
    LogAccionUsuario.belongsTo(Producto, { foreignKey: 'id_producto' });
};

module.exports = establecerRelaciones;