/**
 * @fileoverview Controlador para la gestión de roles de usuario en el sistema Pick&Play.
 * Permite crear, actualizar, eliminar y consultar roles.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Rol = require('../models/rol.model.js');

/**
 * Obtiene todos los roles registrados.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de roles en formato JSON.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerRoles = async (req, res) => {
    try {
        const roles = await Rol.findAll();
        res.json(roles);
    } catch (error) {
        res.json({message: error.message});
    }
}

/**
 * Obtiene un rol específico por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID del rol en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve el rol encontrado o error si no existe.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerRol = async (req, res) => {
    try {
        const rol = await Rol.findByPk(req.params.id)
        res.json(rol);
    } catch (error) {
        res.json({message: error.message});
    }
}

/**
 * Crea un nuevo rol de usuario.
 * @param {import('express').Request} req - Solicitud HTTP con los datos del rol en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si ocurre un error en la creación.
 */
const crearRol = async (req, res) => {
    try {
        await Rol.create(req.body)
        res.json("Rol creado correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

/**
 * Actualiza un rol existente por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID y los datos a actualizar.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si ocurre un error en la actualización.
 */
const actualizarRol = async (req, res) => {
    try {
        await Rol.update(req.body, {
            where: {id_rol: req.params.id}
        })
        res.json("Rol actualizado correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

/**
 * Elimina un rol por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si ocurre un error en la eliminación.
 */
const borrarRol = async (req, res) => {
    try {
        await Rol.destroy({
            where: {id_rol: req.params.id}
        })
        res.json("Rol eliminado correctamente");
    } catch (error) {
        res.json({message: error.message});
        
    }
}

module.exports = {
    traerRoles,
    traerRol,
    crearRol,
    actualizarRol,
    borrarRol
};
