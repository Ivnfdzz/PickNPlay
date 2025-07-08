const AuditoriaService = require("../services/auditoria.service.js");

const obtenerLogs = async (req, res) => {
    try {
        const filtros = {
            id_usuario: req.query.usuario,
            id_accion: req.query.accion,
            id_producto: req.query.producto,
            fecha_desde: req.query.desde,
            limite: req.query.limite ? parseInt(req.query.limite, 10) : 50,
        };

        const logs = await AuditoriaService.obtenerLogs(filtros);

        res.json({
            total: logs.length,
            logs: logs.map((log) => ({
                id: log.id_log,
                usuario: {
                    id: log.Usuario.id_usuario,
                    username: log.Usuario.username,
                    email: log.Usuario.email,
                },
                accion: {
                    id: log.Accion.id_accion,
                    nombre: log.Accion.nombre,
                },
                producto: {
                    id: log.Producto.id_producto,
                    nombre: log.Producto.nombre,
                },
                fecha_hora: log.fecha_hora,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const obtenerEstadisticas = async (req, res) => {
    try {
        const estadisticas = await AuditoriaService.obtenerEstadisticas();
        res.json(estadisticas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const obtenerLogsPorUsuario = async (req, res) => {
    try {
        const filtros = {
            id_usuario: req.params.userId,
            limite: req.query.limite ? parseInt(req.query.limite, 10) : 20,
        };

        const logs = await AuditoriaService.obtenerLogs(filtros);

        if (logs.length === 0) {
            return res.status(404).json({
                message: "No se encontraron logs para este usuario",
            });
        }

        res.json({
            usuario_id: req.params.userId,
            total_acciones: logs.length,
            logs: logs.map((log) => ({
                id: log.id_log,
                accion: log.Accion.nombre,
                producto: log.Producto.nombre,
                fecha_hora: log.fecha_hora,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const obtenerLogsPorProducto = async (req, res) => {
    try {
        const filtros = {
            id_producto: req.params.productId,
            limite: req.query.limite || 20,
        };

        const logs = await AuditoriaService.obtenerLogs(filtros);

        if (logs.length === 0) {
            return res.status(404).json({
                message: "No se encontraron logs para este producto",
            });
        }

        res.json({
            producto_id: req.params.productId,
            producto_nombre: logs[0].Producto.nombre,
            total_modificaciones: logs.length,
            logs: logs.map((log) => ({
                id: log.id_log,
                usuario: log.Usuario.username,
                accion: log.Accion.nombre,
                fecha_hora: log.fecha_hora,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const obtenerResumen = async (req, res) => {
    try {
        // Obtener logs recientes (últimos 7 días)
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 7);

        const logsRecientes = await AuditoriaService.obtenerLogs({
            fecha_desde: fechaDesde,
            limite: 100,
        });

        // Obtener estadísticas generales
        const estadisticas = await AuditoriaService.obtenerEstadisticas();

        res.json({
            resumen_semanal: {
                total_acciones: logsRecientes.length,
                periodo: "Últimos 7 días",
            },
            estadisticas_generales: estadisticas,
            actividad_reciente: logsRecientes.slice(0, 5).map((log) => ({
                usuario: log.Usuario.username,
                accion: log.Accion.nombre,
                producto: log.Producto.nombre,
                fecha: log.fecha_hora,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    obtenerLogs,
    obtenerEstadisticas,
    obtenerLogsPorUsuario,
    obtenerLogsPorProducto,
    obtenerResumen,
};
