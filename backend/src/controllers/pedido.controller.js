const PedidoService = require('../services/pedido.service.js');

const traerPedidos = async (req, res) => {
    try {
        const pedidos = await PedidoService.obtenerTodos();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const traerPedido = async (req, res) => {
    try {
        const pedido = await PedidoService.obtenerPorId(req.params.id);
        
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
        const resultado = await PedidoService.crear(req.body);
        
        res.status(201).json({
            message: 'Pedido creado exitosamente',
            pedido: resultado
        });
    } catch (error) {
        // Manejo específico de errores de validación del service
        if (error.message.includes('no encontrado') || 
            error.message.includes('no activo') || 
            error.message.includes('requeridos') ||
            error.message.includes('al menos')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const borrarPedido = async (req, res) => {
    try {
        const mensaje = await PedidoService.eliminar(req.params.id);
        res.json(mensaje);
    } catch (error) {
        if (error.message === 'Pedido no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    traerPedidos,
    traerPedido,
    crearPedido,
    borrarPedido
};