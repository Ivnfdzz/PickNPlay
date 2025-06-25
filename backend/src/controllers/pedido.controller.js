const Pedido = require('../models/pedido.model.js');
const DetallePedido = require('../models/detallePedido.model.js');
const Producto = require('../models/producto.model.js');
const MetodoPago = require('../models/metodoPago.model.js');
const Categoria = require('../models/categoria.model.js');

const traerPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({
            include: [
                {
                    model: MetodoPago,
                    attributes: ['nombre']
                },
                {
                    model: DetallePedido,
                    include: [
                        {
                            model: Producto,
                            attributes: ['nombre', 'precio'],
                            include: [
                                {
                                    model: Categoria,
                                    as: 'categoria',
                                    attributes: ['nombre']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['fecha', 'DESC']]
        });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const traerPedido = async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id, {
            include: [
                {
                    model: MetodoPago,
                    attributes: ['nombre']
                },
                {
                    model: DetallePedido,
                    include: [
                        {
                            model: Producto,
                            attributes: ['nombre', 'precio', 'descripcion'],
                            include: [
                                {
                                    model: Categoria,
                                    as: 'categoria',
                                    attributes: ['nombre']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json(pedido);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const crearPedido = async (req, res) => {
    try {
        const { nombre_cliente, detallesPedido, id_metodopago } = req.body;

        // Validar datos requeridos
        if (!nombre_cliente || !detallesPedido || !id_metodopago) {
            return res.status(400).json({ 
                message: 'Faltan datos requeridos: nombre_cliente, detallesPedido, id_metodopago' 
            });
        }

        if (!Array.isArray(detallesPedido) || detallesPedido.length === 0) {
            return res.status(400).json({ 
                message: 'El pedido debe tener al menos un producto' 
            });
        }

        // Calcular total del pedido
        let total = 0;
        for (const detalle of detallesPedido) {
            const producto = await Producto.findByPk(detalle.id_producto);
            if (!producto) {
                return res.status(404).json({ 
                    message: `Producto con ID ${detalle.id_producto} no encontrado` 
                });
            }
            if (!producto.activo) {
                return res.status(400).json({ 
                    message: `El producto ${producto.nombre} no está activo` 
                });
            }
            total += producto.precio * detalle.cantidad;
        }

        // Crear el pedido
        const nuevoPedido = await Pedido.create({
            nombre_cliente,
            total,
            id_metodopago
        });

        // Crear los detalles del pedido
        const detalles = [];
        for (const detalle of detallesPedido) {
            detalles.push({
                id_pedido: nuevoPedido.id_pedido,
                id_producto: detalle.id_producto,
                cantidad: detalle.cantidad,
                precio_unitario: (await Producto.findByPk(detalle.id_producto)).precio
            });
        }

        await DetallePedido.bulkCreate(detalles);

        res.status(201).json({
            message: 'Pedido creado exitosamente',
            pedido: {
                id_pedido: nuevoPedido.id_pedido,
                nombre_cliente: nuevoPedido.nombre_cliente,
                total: nuevoPedido.total,
                fecha: nuevoPedido.fecha
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const actualizarPedido = async (req, res) => {
    try {
        const [filasAfectadas] = await Pedido.update(req.body, {
            where: { id_pedido: req.params.id }
        });

        if (filasAfectadas === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json('Pedido actualizado correctamente');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const borrarPedido = async (req, res) => {
    try {
        const filasAfectadas = await Pedido.destroy({
            where: { id_pedido: req.params.id }
        });

        if (filasAfectadas === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json('Pedido eliminado correctamente');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    traerPedidos,
    traerPedido,
    crearPedido,
    actualizarPedido,
    borrarPedido
};