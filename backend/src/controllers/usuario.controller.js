const UsuarioService = require('../services/usuario.service.js');

const traerUsuarios = async (req, res) => {
    try {
        const usuarios = await UsuarioService.obtenerTodos();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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