/**
 * @fileoverview Controlador para la gestión de métodos de pago en Pick&Play.
 * Permite crear, actualizar, eliminar y consultar métodos de pago.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const MetodoPago = require("../models/metodoPago.model.js");

/**
 * Obtiene todos los métodos de pago registrados.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de métodos de pago.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerMetodosPago = async (req, res) => {
    try {
        const metodos = await MetodoPago.findAll();
        res.json(metodos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene un método de pago específico por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID del método en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve el método encontrado o error si no existe.
 * @throws {Error} Si el método no existe o hay un error en la consulta.
 */
const traerMetodoPago = async (req, res) => {
    try {
        const metodo = await MetodoPago.findByPk(req.params.id);
        if (!metodo) {
            return res
                .status(404)
                .json({ message: "Método de pago no encontrado" });
        }
        res.json(metodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene todos los métodos de pago activos.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de métodos de pago activos.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerMetodosPagoActivos = async (req, res) => {
    try {
        const metodos = await MetodoPago.findAll({
            where: { activo: true },
        });
        res.json(metodos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Crea un nuevo método de pago.
 * @param {import('express').Request} req - Solicitud HTTP con los datos del método en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve el método creado o error de validación.
 * @throws {Error} Si ocurre un error en la creación.
 */
const crearMetodoPago = async (req, res) => {
    try {
        const { nombre, activo } = req.body;
        if (!nombre) {
            return res.status(400).json({
                message: "El nombre es requerido",
            });
        }
        const nuevoMetodo = await MetodoPago.create({
            nombre,
            activo: activo !== undefined ? !!activo : true, // true por defecto si no viene
        });
        res.status(201).json({
            message: "Método de pago creado correctamente",
            metodoPago: nuevoMetodo,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Actualiza un método de pago existente por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID y los datos a actualizar.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si el método no existe o hay un error en la actualización.
 */
const actualizarMetodoPago = async (req, res) => {
    try {
        const [filasAfectadas] = await MetodoPago.update(req.body, {
            where: { id_metodopago: req.params.id },
        });
        if (filasAfectadas === 0) {
            return res
                .status(404)
                .json({ message: "Método de pago no encontrado" });
        }
        res.json("Método de pago actualizado correctamente");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Elimina un método de pago por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si el método no existe o hay un error en la eliminación.
 */
const borrarMetodoPago = async (req, res) => {
    try {
        const filasAfectadas = await MetodoPago.destroy({
            where: { id_metodopago: req.params.id },
        });
        if (filasAfectadas === 0) {
            return res
                .status(404)
                .json({ message: "Método de pago no encontrado" });
        }
        res.json("Método de pago eliminado correctamente");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    traerMetodosPago,
    traerMetodoPago,
    traerMetodosPagoActivos,
    crearMetodoPago,
    actualizarMetodoPago,
    borrarMetodoPago,
};
