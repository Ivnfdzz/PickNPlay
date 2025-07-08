/**
 * @fileoverview Controlador para la gestión de acciones en el sistema Pick&Play.
 * Permite obtener todas las acciones o una acción específica por ID.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Accion = require('../models/accion.model.js');

/**
 * Obtiene el listado completo de acciones registradas en el sistema.
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @returns {void} Devuelve un array de acciones en formato JSON.
 * @throws {Error} Si ocurre un error en la consulta a la base de datos.
 */
const traerAcciones = async (req, res) => {
    try {
        const acciones = await Accion.findAll();
        res.json(acciones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene una acción específica por su ID.
 * @param {import('express').Request} req - Objeto de solicitud HTTP con el ID de la acción en los parámetros.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @returns {void} Devuelve la acción encontrada o un error si no existe.
 * @throws {Error} Si la acción no existe o hay un error en la consulta.
 */
const traerAccion = async (req, res) => {
    try {
        const accion = await Accion.findByPk(req.params.id);

        if (!accion) {
            return res.status(404).json({ message: 'Acción no encontrada' });
        }

        res.json(accion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    traerAcciones,
    traerAccion
};