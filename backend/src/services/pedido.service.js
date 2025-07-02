const Pedido = require("../models/pedido.model.js");
const DetallePedido = require("../models/detallePedido.model.js");
const Producto = require("../models/producto.model.js");
const MetodoPago = require("../models/metodoPago.model.js");

class PedidoService {

    static async crear(data) {
        const { nombre_cliente, detallesPedido, id_metodopago } = data;

        // PASO 1: Validaciones
        this._validarDatos(data);
        await this._validarMetodoPago(id_metodopago);
        const productosValidados = await this._validarProductos(detallesPedido);
        
        // PASO 2: Cálculos
        const total = this._calcularTotal(productosValidados);

        // PASO 3: Crear pedido
        const nuevoPedido = await this._crearPedido({
            nombre_cliente,
            total,
            id_metodopago
        });

        // PASO 4: Crear detalles
        await this._crearDetallesPedido(nuevoPedido.id_pedido, productosValidados);

        // PASO 5: Retornar resumen
        return {
            id_pedido: nuevoPedido.id_pedido,
            nombre_cliente: nuevoPedido.nombre_cliente,
            total: nuevoPedido.total,
            fecha: nuevoPedido.fecha,
            cantidad_productos: productosValidados.length,
        };
    }

    static async obtenerTodos() {
        return await Pedido.findAll({
            include: this._getIncludeCompleto(),
            order: [["fecha", "DESC"]],
        });
    }

    static async obtenerPorId(id) {
        return await Pedido.findByPk(id, {
            include: this._getIncludeCompleto(),
        });
    }

    static async eliminar(id) {
        const pedidosEliminados = await Pedido.destroy({
            where: { id_pedido: id },
        });

        if (pedidosEliminados === 0) {
            throw new Error("Pedido no encontrado");
        }

        return "Pedido eliminado correctamente";
    }

    static _validarDatos(data) {
        const { nombre_cliente, detallesPedido, id_metodopago } = data;

        if (!nombre_cliente || !detallesPedido || !id_metodopago) {
            throw new Error("Faltan datos requeridos: nombre_cliente, detallesPedido, id_metodopago");
        }

        if (!Array.isArray(detallesPedido) || detallesPedido.length === 0) {
            throw new Error("El pedido debe tener al menos un producto");
        }
    }

    static async _validarMetodoPago(id_metodopago) {
        const metodoPago = await MetodoPago.findByPk(id_metodopago);
        if (!metodoPago) {
            throw new Error(`Método de pago con ID ${id_metodopago} no encontrado`);
        }

        if (!metodoPago.activo) {
            throw new Error(`El método de pago ${metodoPago.nombre} no está activo`);
        }

        return metodoPago;
    }

    static async _validarProductos(detallesPedido) {
        const productosValidados = [];

        for (const detalle of detallesPedido) {
            // Validar que el producto existe
            const producto = await Producto.findByPk(detalle.id_producto);
            if (!producto) {
                throw new Error(`Producto con ID ${detalle.id_producto} no encontrado`);
            }

            // Validar que el producto está activo
            if (!producto.activo) {
                throw new Error(`El producto ${producto.nombre} no está activo`);
            }

            // Acumular datos validados SIN calcular precios aquí
            productosValidados.push({
                ...detalle,
                producto
            });
        }

        return productosValidados;
    }

    static _calcularTotal(productosValidados) {
        let total = 0;

        for (const item of productosValidados) {
            const subtotal = item.producto.precio * item.cantidad;
            total += subtotal;
        }

        return total;
    }

    static async _crearPedido(datoPedido) {
        return await Pedido.create(datoPedido);
    }

    static async _crearDetallesPedido(id_pedido, productosValidados) {
        const detalles = productosValidados.map((item) => ({
            id_pedido,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio,
        }));

        return await DetallePedido.bulkCreate(detalles);
    }

    static _getIncludeCompleto() {
        return [
            {
                model: MetodoPago,
                attributes: ["nombre"],
            },
            {
                model: DetallePedido,
                include: [
                    {
                        model: Producto,
                        attributes: ["nombre", "precio", "descripcion"],
                    },
                ],
            },
        ];
    }
}

module.exports = PedidoService;