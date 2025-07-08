/**
 * @fileoverview Servicio de Usuarios para el sistema Pick&Play
 * 
 * Gestiona la lógica de negocio relacionada con usuarios del sistema,
 * incluyendo operaciones CRUD, validaciones de unicidad, gestión de roles
 * y estadísticas de usuarios. Coordina las operaciones entre el modelo
 * Usuario y Rol manteniendo la integridad de los datos.
 * 
 * Implementa validaciones exhaustivas para email y username únicos,
 * así como validaciones de roles para garantizar la consistencia
 * del sistema de autorización.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Usuario = require('../models/usuario.model.js');
const Rol = require('../models/rol.model.js');
const { Op } = require('sequelize');

/**
 * Servicio para la gestión de usuarios del sistema
 * 
 * @class UsuarioService
 * @description Proporciona métodos para crear, consultar, actualizar y eliminar
 *              usuarios, incluyendo validaciones de negocio y estadísticas.
 */
class UsuarioService {
    /**
     * Obtiene todos los usuarios con información de rol
     * 
     * @async
     * @returns {Promise<Array>} Array de usuarios con roles (sin contraseñas)
     */
    static async obtenerTodos() {
        return await Usuario.findAll({
            include: this._getIncludeRol(),
            attributes: { exclude: ['password'] }
        });
    }

    /**
     * Obtiene un usuario específico por ID
     * 
     * @async
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Usuario con información de rol
     * @throws {Error} Si el usuario no existe
     */
    static async obtenerPorId(id) {
        const usuario = await Usuario.findByPk(id, {
            include: this._getIncludeRol(),
            attributes: { exclude: ['password'] }
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        return usuario;
    }

    /**
     * Crea un nuevo usuario con validaciones completas
     * 
     * @async
     * @param {Object} data - Datos del usuario a crear
     * @param {string} data.username - Nombre de usuario único
     * @param {string} data.email - Email único del usuario
     * @param {string} data.password - Contraseña (será encriptada automáticamente)
     * @param {number} data.id_rol - ID del rol a asignar
     * @returns {Promise<Object>} Usuario creado (sin contraseña)
     * @throws {Error} Si faltan datos, el rol no existe o hay duplicados
     */
    static async crear(data) {
        // Validaciones básicas
        this._validarDatosUsuario(data);

        // Validar que el rol existe
        await this._validarRolExiste(data.id_rol);
        
        // Validar duplicados
        await this._validarUsuarioUnico(data.email, data.username);

        // Crear usuario
        const nuevoUsuario = await Usuario.create(data);

        return {
            id_usuario: nuevoUsuario.id_usuario,
            username: nuevoUsuario.username,
            email: nuevoUsuario.email,
            id_rol: nuevoUsuario.id_rol,
            fecha_registro: nuevoUsuario.fecha_registro
        };
    }

    /**
     * Actualiza un usuario existente
     * 
     * @async
     * @param {number} id - ID del usuario a actualizar
     * @param {Object} data - Datos a actualizar
     * @returns {Promise<string>} Mensaje de confirmación
     * @throws {Error} Si el usuario no existe, rol inválido o datos duplicados
     */
    static async actualizar(id, data) {
        // Validar que el usuario existe
        const usuario = await this.obtenerPorId(id);

        // Si se está actualizando el rol, validarlo
        if (data.id_rol) {
            await this._validarRolExiste(data.id_rol);
        }

        // Si se está actualizando email o username, validar únicos
        if (data.email || data.username) {
            await this._validarUsuarioUnicoParaActualizacion(id, data.email, data.username);
        }

        // Actualizar campos manualmente
        Object.keys(data).forEach(key => {
            usuario[key] = data[key];
        });

        await usuario.save();

        return 'Usuario actualizado correctamente';
    }

    /**
     * Elimina un usuario por ID
     * 
     * @async
     * @param {number} id - ID del usuario a eliminar
     * @returns {Promise<string>} Mensaje de confirmación
     * @throws {Error} Si el usuario no existe
     */
    static async eliminar(id) {
        // Validar que el usuario existe
        await this.obtenerPorId(id);

        const filasAfectadas = await Usuario.destroy({
            where: { id_usuario: id }
        });

        if (filasAfectadas === 0) {
            throw new Error('Usuario no encontrado');
        }

        return 'Usuario eliminado correctamente';
    }

    /**
     * Obtiene usuarios filtrados por rol
     * 
     * @async
     * @param {string} rolNombre - Nombre del rol a filtrar
     * @returns {Promise<Array>} Array de usuarios con el rol especificado
     * @throws {Error} Si el rol no existe
     */
    static async obtenerPorRol(rolNombre) {
        const rol = await Rol.findOne({ where: { nombre: rolNombre } });
        if (!rol) {
            throw new Error(`Rol '${rolNombre}' no encontrado`);
        }

        return await Usuario.findAll({
            where: { id_rol: rol.id_rol },
            include: this._getIncludeRol(),
            attributes: { exclude: ['password'] }
        });
    }

    /**
     * Genera estadísticas de usuarios del sistema
     * 
     * @async
     * @returns {Promise<Object>} Estadísticas de usuarios por rol
     * @property {number} total - Total de usuarios
     * @property {Array} por_rol - Distribución por roles
     */
    static async contarUsuarios() {
        const total = await Usuario.count();

        const roots = await Usuario.count({ where: { id_rol: 1 } });
        const analistas = await Usuario.count({ where: { id_rol: 2 } });
        const repositores = await Usuario.count({ where: { id_rol: 3 } });

        return {
            total,
            por_rol: [
                { rol: 'root', cantidad: roots },
                { rol: 'analista', cantidad: analistas },
                { rol: 'repositor', cantidad: repositores }
            ]
        };
    }

    /**
     * Configuración de include para consultas con rol
     * 
     * @private
     * @returns {Array} Array de configuración de includes para Sequelize
     */
    static _getIncludeRol() {
        return [
            {
                model: Rol,
                attributes: ['nombre']
            }
        ];
    }

    /**
     * Valida la estructura básica de los datos del usuario
     * 
     * @private
     * @param {Object} data - Datos del usuario a validar
     * @throws {Error} Si faltan campos requeridos o formato inválido
     */
    static _validarDatosUsuario(data) {
        const { username, email, password, id_rol } = data;

        if (!username || !email || !password || !id_rol) {
            throw new Error('Username, email, password e id_rol son requeridos');
        }

        if (!email.includes('@')) {
            throw new Error('Formato de email inválido');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        if (typeof username !== 'string' || username.trim() === '') {
            throw new Error('El username debe ser un texto válido');
        }
    }

    /**
     * Valida que el rol especificado existe en el sistema
     * 
     * @async
     * @private
     * @param {number} id_rol - ID del rol a validar
     * @returns {Promise<Object>} Rol encontrado
     * @throws {Error} Si el rol no existe
     */
    static async _validarRolExiste(id_rol) {
        const rol = await Rol.findByPk(id_rol);
        if (!rol) {
            throw new Error(`Rol con ID ${id_rol} no encontrado`);
        }
        return rol;
    }

    /**
     * Valida que email y username sean únicos en el sistema
     * 
     * @async
     * @private
     * @param {string} email - Email a validar
     * @param {string} username - Username a validar
     * @throws {Error} Si alguno ya está registrado
     */
    static async _validarUsuarioUnico(email, username) {
        const existingEmail = await Usuario.findOne({ where: { email } });
        if (existingEmail) {
            throw new Error('Email ya registrado');
        }

        const existingUsername = await Usuario.findOne({ where: { username } });
        if (existingUsername) {
            throw new Error('Username ya registrado');
        }
    }

    /**
     * Valida unicidad para actualizaciones excluyendo el usuario actual
     * 
     * @async
     * @private
     * @param {number} userId - ID del usuario que se está actualizando
     * @param {string} email - Email a validar (opcional)
     * @param {string} username - Username a validar (opcional)
     * @throws {Error} Si alguno ya está registrado por otro usuario
     */
    static async _validarUsuarioUnicoParaActualizacion(userId, email, username) {
        if (email) {
            const existingEmail = await Usuario.findOne({
                where: {
                    email,
                    id_usuario: { [Op.ne]: userId }
                }
            });
            if (existingEmail) {
                throw new Error('Email ya registrado');
            }
        }

        if (username) {
            const existingUsername = await Usuario.findOne({
                where: {
                    username,
                    id_usuario: { [Op.ne]: userId }
                }
            });
            if (existingUsername) {
                throw new Error('Username ya registrado');
            }
        }
    }
}

/**
 * Exporta el servicio de usuarios para su uso en controladores.
 * 
 * @module UsuarioService
 * @description Servicio central para la gestión de usuarios del sistema.
 *              Utilizado por el controlador de usuarios y funciones administrativas.
 */
module.exports = UsuarioService;