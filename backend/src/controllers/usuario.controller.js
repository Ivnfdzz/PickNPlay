const Usuario = require("../models/usuario.model.js");
const Rol = require("../models/rol.model.js");

const traerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [
                {
                    model: Rol,
                    attributes: ["nombre"],
                },
            ],
            attributes: { exclude: ["password"] },
        });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const traerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id, {
            include: [
                {
                    model: Rol,
                    attributes: ["nombre"],
                },
            ],
            attributes: { exclude: ["password"] },
        });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const crearUsuario = async (req, res) => {
    try {
        await Usuario.create(req.body);
        res.json("Usuario creado correctamente");
    } catch (error) {
        res.json({ message: error.message });
    }
};

const actualizarUsuario = async (req, res) => {
    try {
        await Usuario.update(req.body, {
            where: { id_usuario: req.params.id },
        });
        res.json("Usuario actualizado correctamente");
    } catch (error) {
        res.json({ message: error.message });
    }
};

const borrarUsuario = async (req, res) => {
    try {
        await Usuario.destroy({
            where: { id_usuario: req.params.id },
        });
        res.json("Usuario eliminado correctamente");
    } catch (error) {
        res.json({ message: error.message });
    }
};

module.exports = {
    traerUsuarios,
    traerUsuario,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario,
};
