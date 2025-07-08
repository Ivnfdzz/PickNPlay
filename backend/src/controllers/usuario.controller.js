/**
 * @fileoverview Controlador para la gestión de usuarios en el sistema Pick&Play.
 * Permite crear, actualizar, eliminar y consultar usuarios, así como obtener estadísticas.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const UsuarioService = require('../services/usuario.service.js');

/**
 * Obtiene todos los usuarios registrados.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de usuarios en formato JSON.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerUsuarios = async (req, res) => {
    try {
        const usuarios = await UsuarioService.obtenerTodos();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene un usuario específico por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID del usuario en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve el usuario encontrado o error si no existe.
 * @throws {Error} Si el usuario no existe o hay un error en la consulta.
 */
const traerUsuario = async (req, res) => {
    try {
        const usuario = await UsuarioService.obtenerPorId(req.params.id);
        res.json(usuario);
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Crea un nuevo usuario.
 * @param {import('express').Request} req - Solicitud HTTP con los datos del usuario en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve el usuario creado o error de validación.
 * @throws {Error} Si ocurre un error en la creación o validación.
 */
const crearUsuario = async (req, res) => {
    try {
        const nuevoUsuario = await UsuarioService.crear(req.body);
        res.status(201).json({
            message: 'Usuario creado correctamente',
            usuario: nuevoUsuario
        });
    } catch (error) {
        if (error.message.includes('requeridos') || 
            error.message.includes('inválido') ||
            error.message.includes('ya registrado') ||
            error.message.includes('caracteres') ||
            error.message.includes('texto válido') ||
            error.message.includes('no encontrado')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Actualiza un usuario existente por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID y los datos a actualizar.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si el usuario no existe o hay un error en la actualización.
 */
const actualizarUsuario = async (req, res) => {
    try {
        const mensaje = await UsuarioService.actualizar(req.params.id, req.body);
        res.json(mensaje);
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('ya registrado') || 
            error.message.includes('no encontrado')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Elimina un usuario por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si el usuario no existe o hay un error en la eliminación.
 */
const borrarUsuario = async (req, res) => {
    try {
        const mensaje = await UsuarioService.eliminar(req.params.id);
        res.json(mensaje);
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene estadísticas generales de usuarios.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve estadísticas de usuarios.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const obtenerEstadisticas = async (req, res) => {
    try {
        const estadisticas = await UsuarioService.contarUsuarios();
        res.json(estadisticas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    traerUsuarios,
    traerUsuario,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario,
    obtenerEstadisticas
};