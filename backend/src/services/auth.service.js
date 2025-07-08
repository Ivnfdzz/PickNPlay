/**
 * @fileoverview Servicio de Autenticación para el sistema Pick&Play
 * 
 * Gestiona la autenticación y autorización de usuarios en el sistema,
 * incluyendo validación de credenciales, generación de tokens JWT,
 * verificación de tokens y gestión de perfiles de usuario.
 * 
 * Implementa seguridad basada en JWT (JSON Web Tokens) para mantener
 * sesiones seguras y stateless entre el cliente y el servidor.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model.js');
const Rol = require('../models/rol.model.js');
require('dotenv').config();

/**
 * Servicio para la gestión de autenticación y autorización
 * 
 * @class AuthService
 * @description Proporciona métodos para validar credenciales, generar tokens,
 *              verificar autenticación y gestionar perfiles de usuario.
 */
class AuthService {
    /**
     * Valida las credenciales de un usuario para el login
     * 
     * @async
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<Object>} Usuario validado con información del rol
     * @throws {Error} Si las credenciales son inválidas o el usuario no existe
     * 
     * @example
     * const usuario = await AuthService.validarCredenciales('admin@test.com', 'password123');
     * console.log(usuario.Rol.nombre); // 'admin'
     */
    static async validarCredenciales(email, password) {
        // Validar campos requeridos
        this._validarCamposLogin(email, password);

        // Buscar usuario con rol incluido
        const usuario = await this._buscarUsuarioPorEmail(email);

        // Validar contraseña
        await this._validarPassword(usuario, password);

        return usuario;
    }

    /**
     * Genera un token JWT para un usuario autenticado
     * 
     * @param {Object} usuario - Objeto usuario con datos necesarios
     * @param {number} usuario.id_usuario - ID del usuario
     * @param {string} usuario.email - Email del usuario
     * @param {number} usuario.id_rol - ID del rol del usuario
     * @returns {string} Token JWT firmado
     * 
     * @description El token incluye ID, email y rol del usuario con expiración
     *              configurada en variables de entorno.
     */
    static generarToken(usuario) {
        return jwt.sign(
            { 
                id_usuario: usuario.id_usuario,
                email: usuario.email,
                rol: usuario.id_rol
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
    }

    /**
     * Obtiene el perfil completo de un usuario por su ID
     * 
     * @async
     * @param {number} id_usuario - ID del usuario
     * @returns {Promise<Object>} Usuario con información del rol (sin contraseña)
     * @throws {Error} Si el usuario no existe
     */
    static async obtenerPerfil(id_usuario) {
        const usuario = await Usuario.findByPk(id_usuario, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Rol,
                    attributes: ['nombre']
                }
            ]
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        return usuario;
    }

    /**
     * Formatea la respuesta de login exitoso
     * 
     * @param {Object} usuario - Usuario autenticado
     * @param {string} token - Token JWT generado
     * @returns {Object} Objeto con mensaje, datos del usuario y token
     * 
     * @description Estructura la respuesta del login excluyendo información
     *              sensible como la contraseña.
     */
    static formatearRespuestaLogin(usuario, token) {
        return {
            message: 'Inicio de sesión exitoso',
            usuario: {
                id_usuario: usuario.id_usuario,
                username: usuario.username,
                email: usuario.email,
                rol: usuario.Rol.nombre
            },
            token: token
        };
    }

    /**
     * Verifica la validez de un token JWT
     * 
     * @param {string} token - Token JWT a verificar
     * @returns {Object} Payload decodificado del token
     * @throws {Error} Si el token es inválido o ha expirado
     */
    static verificarToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Token no válido o expirado');
        }
    }

    /**
     * Valida que los campos de login sean correctos
     * 
     * @private
     * @param {string} email - Email a validar
     * @param {string} password - Contraseña a validar
     * @throws {Error} Si algún campo es inválido
     */
    static _validarCamposLogin(email, password) {
        if (!email || !password) {
            throw new Error('Email y password son requeridos');
        }

        if (!email.includes('@')) {
            throw new Error('Formato de email inválido');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
    }

    /**
     * Busca un usuario por email incluyendo información del rol
     * 
     * @async
     * @private
     * @param {string} email - Email del usuario a buscar
     * @returns {Promise<Object>} Usuario encontrado con rol incluido
     * @throws {Error} Si el usuario no existe
     */
    static async _buscarUsuarioPorEmail(email) {
        const usuario = await Usuario.findOne({ 
            where: { email: email },
            include: [
                {
                    model: Rol,
                    attributes: ['nombre']
                }
            ]
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        return usuario;
    }

    /**
     * Valida la contraseña del usuario usando el método del modelo
     * 
     * @async
     * @private
     * @param {Object} usuario - Usuario con método validarPassword
     * @param {string} password - Contraseña a validar
     * @throws {Error} Si la contraseña es incorrecta
     */
    static async _validarPassword(usuario, password) {
        const isValidPassword = await usuario.validarPassword(password);
        if (!isValidPassword) {
            throw new Error('Contraseña incorrecta');
        }
    }

}

/**
 * Exporta el servicio de autenticación para su uso en controladores y middlewares.
 * 
 * @module AuthService
 * @description Servicio central para autenticación y autorización del sistema.
 *              Utilizado por el controlador de auth y middleware de autenticación.
 */
module.exports = AuthService;