/**
 * @fileoverview Controlador para la gestión de pedidos en el sistema Pick&Play.
 * Permite crear, consultar y eliminar pedidos.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const PedidoService = require('../services/pedido.service.js');

/**
 * Obtiene todos los pedidos registrados.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de pedidos en formato JSON.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerPedidos = async (req, res) => {
    try {
        const pedidos = await PedidoService.obtenerTodos();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene un pedido específico por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID del pedido en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve el pedido encontrado o error si no existe.
 * @throws {Error} Si el pedido no existe o hay un error en la consulta.
 */
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

/**
 * Crea un nuevo pedido.
 * @param {import('express').Request} req - Solicitud HTTP con los datos del pedido en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve el pedido creado o error de validación.
 * @throws {Error} Si ocurre un error en la creación o validación.
 */
const crearPedido = async (req, res) => {
    try {
        const resultado = await PedidoService.crear(req.body);
        res.status(201).json({
            message: 'Pedido creado exitosamente',
            pedido: resultado
        });
    } catch (error) {
        if (error.message.includes('no encontrado') || 
            error.message.includes('no activo') || 
            error.message.includes('requeridos') ||
            error.message.includes('al menos')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Elimina un pedido por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID del pedido en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si el pedido no existe o hay un error en la eliminación.
 */
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