const Pedido = require("../models/pedido.model.js");
const DetallePedido = require("../models/detallePedido.model.js");
const Producto = require("../models/producto.model.js");
const MetodoPago = require("../models/metodoPago.model.js");
const Categoria = require("../models/categoria.model.js");

/**
 * Valida los datos del pedido
 */
const validarDatosPedido = (data) => {
    // 1. Destructuring de los datos de entrada
    const { nombre_cliente, detallesPedido, id_metodopago } = data;

    // 2. Validar campos obligatorios
    if (!nombre_cliente || !detallesPedido || !id_metodopago) {
        throw new Error("Faltan datos requeridos...");
    }

    // 3. Validar estructura de detalles
    if (!Array.isArray(detallesPedido) || detallesPedido.length === 0) {
        throw new Error("El pedido debe tener al menos un producto");
    }
};

/**
 * Valida y calcula el total del pedido
 */
const validarYCalcularTotal = async (detallesPedido) => {
    let total = 0;
    const productosValidados = [];

    for (const detalle of detallesPedido) {
        // 1. CONSULTA A PRODUCTO (Entidad PRODUCTO del DER)
        const producto = await Producto.findByPk(detalle.id_producto);

        // 2. VALIDAR EXISTENCIA
        if (!producto) {
            throw new Error(`Producto con ID ${detalle.id_producto} no encontrado`);
        }

        // 3. VALIDAR ESTADO ACTIVO (Campo 'activo' de PRODUCTO)
        if (!producto.activo) {
            throw new Error(`El producto ${producto.nombre} no está activo`);
        }

        // 4. CALCULAR SUBTOTAL
        const subtotal = producto.precio * detalle.cantidad;
        total += subtotal;

        // 5. ACUMULAR DATOS VALIDADOS
        productosValidados.push({
            ...detalle,      // id_producto, cantidad del DETALLEPEDIDO
            producto,        // Objeto completo de PRODUCTO
            subtotal,        // Calculado
        });
    }

    return { total, productosValidados };
};

/**
 * Crea un pedido completo con sus detalles
 */
const crearPedidoCompleto = async (data) => {
    const { nombre_cliente, detallesPedido, id_metodopago } = data;

    // PASO 1: VALIDAR DATOS (Función anterior)
    validarDatosPedido(data);

    // PASO 2: VALIDAR PRODUCTOS Y CALCULAR TOTAL (Función anterior)
    const { total, productosValidados } = await validarYCalcularTotal(detallesPedido);

    // PASO 3: CREAR REGISTRO EN TABLA PEDIDO
    const nuevoPedido = await Pedido.create({
        nombre_cliente,    // Campo de PEDIDO
        total,            // Campo de PEDIDO (calculado)
        id_metodopago,    // FK hacia METODOPAGO
    });

    // PASO 4: CREAR REGISTROS EN TABLA DETALLEPEDIDO
    const detalles = productosValidados.map((item) => ({
        id_pedido: nuevoPedido.id_pedido,        // FK hacia PEDIDO (recién creado)
        id_producto: item.id_producto,           // FK hacia PRODUCTO
        cantidad: item.cantidad,                 // Campo de DETALLEPEDIDO
        precio_unitario: item.producto.precio,  // Campo de DETALLEPEDIDO
    }));

    await DetallePedido.bulkCreate(detalles);

    // PASO 5: RETORNAR RESUMEN
    return {
        id_pedido: nuevoPedido.id_pedido,
        nombre_cliente: nuevoPedido.nombre_cliente,
        total: nuevoPedido.total,
        fecha: nuevoPedido.fecha,
    };
};

/**
 * Include estándar para consultas de pedidos
 */
const getIncludeEstandar = () => [
    {
        model: MetodoPago,
        attributes: ["nombre"],
    },
    {
        model: DetallePedido,
        include: [
            {
                model: Producto,
                attributes: ["nombre", "precio"]
            },
        ],
    },
];

/**
 * Obtiene pedidos con includes estándar
 */
const obtenerPedidos = async () => {
    return await Pedido.findAll({
        include: getIncludeEstandar(),
        order: [["fecha", "DESC"]],
    });
};

/**
 * Obtiene un pedido por ID con includes completos
 */
const obtenerPedidoPorId = async (id) => {
    return await Pedido.findByPk(id, {
        include: getIncludeEstandar(),
    });
};

module.exports = {
    validarDatosPedido,
    validarYCalcularTotal,
    crearPedidoCompleto,
    obtenerPedidos,
    obtenerPedidoPorId,
    getIncludeEstandar,
};
