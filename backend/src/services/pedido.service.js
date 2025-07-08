/**
 * @fileoverview Servicio de Pedidos para el sistema Pick&Play
 * 
 * Gestiona la lógica de negocio relacionada con los pedidos de alquiler,
 * incluyendo creación, validación, cálculos y consultas. Coordina la
 * interacción entre Pedido, DetallePedido, Producto y MetodoPago para
 * asegurar transacciones consistentes.
 * 
 * Implementa validaciones exhaustivas de productos, métodos de pago
 * y cálculos automáticos de totales para garantizar la integridad
 * de las transacciones de alquiler.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Pedido = require("../models/pedido.model.js");
const DetallePedido = require("../models/detallePedido.model.js");
const Producto = require("../models/producto.model.js");
const MetodoPago = require("../models/metodoPago.model.js");

/**
 * Servicio para la gestión de pedidos de alquiler
 * 
 * @class PedidoService
 * @description Proporciona métodos para crear, consultar y gestionar pedidos,
 *              incluyendo validaciones de negocio y cálculos automáticos.
 */
class PedidoService {

    /**
     * Crea un nuevo pedido con validaciones completas
     * 
     * @async
     * @param {Object} data - Datos del pedido a crear
     * @param {string} data.nombre_cliente - Nombre del cliente
     * @param {Array} data.detallesPedido - Array de productos con cantidades
     * @param {number} data.id_metodopago - ID del método de pago
     * @returns {Promise<Object>} Resumen del pedido creado
     * @throws {Error} Si faltan datos, productos inválidos o método de pago inactivo
     * 
     * @description Proceso de creación:
     *              1. Validar estructura de datos
     *              2. Validar método de pago activo
     *              3. Validar productos existentes y activos
     *              4. Calcular total automáticamente
     *              5. Crear pedido y detalles
     */
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

    /**
     * Obtiene todos los pedidos con información completa
     * 
     * @async
     * @returns {Promise<Array>} Array de pedidos con detalles y relaciones
     * @description Incluye método de pago, detalles y productos relacionados,
     *              ordenados por fecha descendente.
     */
    static async obtenerTodos() {
        return await Pedido.findAll({
            include: this._getIncludeCompleto(),
            order: [["fecha", "DESC"]],
        });
    }

    /**
     * Obtiene un pedido específico por ID
     * 
     * @async
     * @param {number} id - ID del pedido
     * @returns {Promise<Object|null>} Pedido con información completa o null
     */
    static async obtenerPorId(id) {
        return await Pedido.findByPk(id, {
            include: this._getIncludeCompleto(),
        });
    }

    /**
     * Elimina un pedido por ID
     * 
     * @async
     * @param {number} id - ID del pedido a eliminar
     * @returns {Promise<string>} Mensaje de confirmación
     * @throws {Error} Si el pedido no existe
     */
    static async eliminar(id) {
        const pedidosEliminados = await Pedido.destroy({
            where: { id_pedido: id },
        });

        if (pedidosEliminados === 0) {
            throw new Error("Pedido no encontrado");
        }

        return "Pedido eliminado correctamente";
    }

    /**
     * Valida la estructura básica de los datos del pedido
     * 
     * @private
     * @param {Object} data - Datos del pedido a validar
     * @throws {Error} Si faltan campos requeridos o estructura inválida
     */
    static _validarDatos(data) {
        const { nombre_cliente, detallesPedido, id_metodopago } = data;

        if (!nombre_cliente || !detallesPedido || !id_metodopago) {
            throw new Error("Faltan datos requeridos: nombre_cliente, detallesPedido, id_metodopago");
        }

        if (!Array.isArray(detallesPedido) || detallesPedido.length === 0) {
            throw new Error("El pedido debe tener al menos un producto");
        }
    }

    /**
     * Valida que el método de pago exista y esté activo
     * 
     * @async
     * @private
     * @param {number} id_metodopago - ID del método de pago
     * @returns {Promise<Object>} Método de pago validado
     * @throws {Error} Si el método no existe o está inactivo
     */
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

    /**
     * Valida que todos los productos existan y estén activos
     * 
     * @async
     * @private
     * @param {Array} detallesPedido - Array de detalles con id_producto y cantidad
     * @returns {Promise<Array>} Array de productos validados con información completa
     * @throws {Error} Si algún producto no existe o está inactivo
     */
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

            // Acumular datos validados
            productosValidados.push({
                ...detalle,
                producto
            });
        }

        return productosValidados;
    }

    /**
     * Calcula el total del pedido basado en productos y cantidades
     * 
     * @private
     * @param {Array} productosValidados - Array de productos con información completa
     * @returns {number} Total calculado del pedido
     */
    static _calcularTotal(productosValidados) {
        let total = 0;

        for (const item of productosValidados) {
            const subtotal = item.producto.precio * item.cantidad;
            total += subtotal;
        }

        return total;
    }

    /**
     * Crea el registro principal del pedido
     * 
     * @async
     * @private
     * @param {Object} datoPedido - Datos básicos del pedido
     * @returns {Promise<Object>} Pedido creado
     */
    static async _crearPedido(datoPedido) {
        return await Pedido.create(datoPedido);
    }

    /**
     * Crea todos los detalles del pedido en lote
     * 
     * @async
     * @private
     * @param {number} id_pedido - ID del pedido padre
     * @param {Array} productosValidados - Array de productos con información completa
     * @returns {Promise<Array>} Detalles creados
     */
    static async _crearDetallesPedido(id_pedido, productosValidados) {
        const detalles = productosValidados.map((item) => ({
            id_pedido,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio,
        }));

        return await DetallePedido.bulkCreate(detalles);
    }

    /**
     * Configuración de include para consultas completas
     * 
     * @private
     * @returns {Array} Array de configuración de includes para Sequelize
     */
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

/**
 * Exporta el servicio de pedidos para su uso en controladores.
 * 
 * @module PedidoService
 * @description Servicio central para la gestión de transacciones de alquiler.
 *              Utilizado por el controlador de pedidos y el frontend del autoservicio.
 */
module.exports = PedidoService;