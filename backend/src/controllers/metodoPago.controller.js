const MetodoPago = require("../models/metodoPago.model.js");

const traerMetodosPago = async (req, res) => {
    try {
        const metodos = await MetodoPago.findAll();
        res.json(metodos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
