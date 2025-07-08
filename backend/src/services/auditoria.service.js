const LogAccionUsuario = require('../models/logAccionUsuario.model.js');
const Accion = require('../models/accion.model.js');
const Usuario = require('../models/usuario.model.js');
const Producto = require('../models/producto.model.js');
const { Op } = require('sequelize');

class AuditoriaService {
    static async registrarAccion(id_usuario, nombreAccion, id_producto) {
        try {
            if (!id_usuario || !nombreAccion || !id_producto) {
                throw new Error("Faltan parámetros para auditoría");
            }

            const accion = await this._obtenerAccionPorNombre(nombreAccion);

            if (!accion) {
                throw new Error(`Acción '${nombreAccion}' no encontrada en la DB`);
            }

            await this._validarDatos(id_usuario, id_producto);

            const nuevoLog = await LogAccionUsuario.create({
                id_usuario: id_usuario,
                id_accion: accion.id_accion,
                id_producto: id_producto,
                fecha_hora: new Date()
            });

            console.log(`AUDITORÍA: Usuario ${id_usuario} realizó '${nombreAccion}' en producto ${id_producto}`);

            return nuevoLog;

        } catch (error) {
            console.error('Error registrando auditoría:', error.message);
        }
    }

    static async obtenerLogs(filtros = {}) {
        const whereClause = {};

        // Filtro por usuario
        if (filtros.id_usuario) {
            whereClause.id_usuario = filtros.id_usuario;
        }

        // Filtro por acción
        if (filtros.id_accion) {
            whereClause.id_accion = filtros.id_accion;
        }

        // Filtro por fecha desde
        if (filtros.fecha_desde) {
            whereClause.fecha_hora = {
                [Op.gte]: filtros.fecha_desde
            };
        }

        // Filtro por producto
        if (filtros.id_producto) {
            whereClause.id_producto = filtros.id_producto;
        }

        return await LogAccionUsuario.findAll({
            where: whereClause,
            include: [
                {
                    model: Usuario,
                    attributes: ['username', 'email']
                },
                {
                    model: Accion,
                    attributes: ['nombre']
                },
                {
                    model: Producto,
                    attributes: ['nombre']
                }
            ],
            order: [['fecha_hora', 'DESC']],
            limit: filtros.limite || 100
        });
    }

    static async obtenerEstadisticas() {
        const logs = await LogAccionUsuario.findAll({
            include: [
                {
                    model: Usuario,
                    attributes: ['username']
                },
                {
                    model: Accion,
                    attributes: ['nombre']
                },
                {
                    model: Producto,
                    attributes: ['nombre']
                }
            ],
            limit: 1000
        });

        // Contar por tipo de acción
        const accionesPorTipo = {};
        logs.forEach(log => {
            const accion = log.Accion?.nombre || "-";
            accionesPorTipo[accion] = (accionesPorTipo[accion] || 0) + 1;
        });

        // Contar por usuario
        const usuariosMasActivos = {};
        logs.forEach(log => {
            const usuario = log.Usuario?.username || "-";
            usuariosMasActivos[usuario] = (usuariosMasActivos[usuario] || 0) + 1;
        });

        const productosMasModificados = {};
        logs.forEach(log => {
            let producto = log.Producto?.nombre;
            if (!producto && log.id_producto) {
                producto = `Producto eliminado (ID: ${log.id_producto})`;
            }
            producto = producto || "-";
            productosMasModificados[producto] = (productosMasModificados[producto] || 0) + 1;
        });

        return {
            total_acciones: logs.length,
            acciones_por_tipo: accionesPorTipo,
            usuarios_mas_activos: usuariosMasActivos,
            productos_mas_modificados: productosMasModificados,
            acciones_recientes: logs.slice(0, 10).map(log => ({
                usuario: log.Usuario?.username || "-",
                accion: log.Accion?.nombre || "-",
                producto: log.Producto?.nombre || (log.id_producto ? `Producto eliminado (ID: ${log.id_producto})` : "-"),
                fecha: log.fecha_hora
            })) 
        };
    }

    static async _obtenerAccionPorNombre(nombreAccion) {
        return await Accion.findOne({
            where: { nombre: nombreAccion }
        });
    }

    static async _validarDatos(id_usuario, id_producto) {
        const usuario = await Usuario.findByPk(id_usuario);
        if (!usuario) {
            throw new Error(`Usuario con ID ${id_usuario} no encontrado`);
        }
        if (!id_producto) {
            throw new Error("ID de producto es requerido para auditoría");
        }

        const producto = await Producto.findByPk(id_producto);
        if (!producto) {
            throw new Error(`Producto con ID ${id_producto} no encontrado`);
        }

        return true;
    }
}

module.exports = AuditoriaService;