const Accion = require('../models/accion.model.js');

const traerAcciones = async (req, res) => {
    try {
        const acciones = await Accion.findAll();
        res.json(acciones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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