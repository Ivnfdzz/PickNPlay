const usuarioModel = require('../models/usuarioModel.js');

const traerUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioModel.findAll(); // Obtiene todos los usuarios de la base de datos
        res.json(usuarios); // Envía los usuarios como respuesta en formato JSON
    } catch (error) {
        res.json({message: error.message});
    }
}

const traerUsuario = async (req, res) => {
    try {
        const usuario = await usuarioModel.findByPk(req.params.id)
        res.json(usuario);
    } catch (error) {
        res.json({message: error.message});
    }
}

const crearUsuario = async (req, res) => {
    try {
        await usuarioModel.create(req.body)
        res.json("Usuario creado correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

const actualizarUsuario = async (req, res) => {
    try {
        await usuarioModel.update(req.body, {
            where: {id_usuario: req.params.id}
        })
        res.json("Usuario actualizado correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

const borrarUsuario = async (req, res) => {
    try {
        await usuarioModel.destroy({
            where: {id_usuario: req.params.id}
        })
        res.json("Usuario eliminado correctamente");
    } catch (error) {
        res.json({message: error.message});
        
    }
}

module.exports = {
    traerUsuarios,
    traerUsuario,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario
};