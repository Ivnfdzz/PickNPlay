const rolModel = require('../models/rol.model.js');

const traerRoles = async (req, res) => {
    try {
        const roles = await rolModel.findAll(); // Obtiene todos los roles de la base de datos
        res.json(roles); // Envía los roles como respuesta en formato JSON
    } catch (error) {
        res.json({message: error.message});
    }
}

const traerRol = async (req, res) => {
    try {
        const rol = await rolModel.findByPk(req.params.id)
        res.json(rol);
    } catch (error) {
        res.json({message: error.message});
    }
}

const crearRol = async (req, res) => {
    try {
        await rolModel.create(req.body)
        res.json("Rol creado correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

const actualizarRol = async (req, res) => {
    try {
        await rolModel.update(req.body, {
            where: {id_rol: req.params.id}
        })
        res.json("Rol actualizado correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

const borrarRol = async (req, res) => {
    try {
        await rolModel.destroy({
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