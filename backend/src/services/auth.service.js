const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model.js');
const Rol = require('../models/rol.model.js');
require('dotenv').config();

class AuthService {
    static async validarCredenciales(email, password) {
        // Validar campos requeridos
        this._validarCamposLogin(email, password);

        // Buscar usuario con rol incluido
        const usuario = await this._buscarUsuarioPorEmail(email);

        // Validar contraseña
        await this._validarPassword(usuario, password);

        return usuario;
    }

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

    static verificarToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Token no válido o expirado');
        }
    }

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

    static async _validarPassword(usuario, password) {
        const isValidPassword = await usuario.validarPassword(password);
        if (!isValidPassword) {
            throw new Error('Contraseña incorrecta');
        }
    }

}

module.exports = AuthService;