const jwt = require('jsonwebtoken');
const { Usuario } = require('../models/usuario.model.js');
const { Rol } = require('../models/rol.model.js');
require('dotenv').config();

const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // valida los campos requeridos
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Username, email y password son requeridos' 
            });
        }
        
        // Verifica si el usuario ya existe
        const existingUser = await Usuario.findOne({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email ya registrado' });
        }

        const existingUsername = await Usuario.findOne({
            where: { username: username }
        });

        if (existingUsername) {
            return res.status(400).json({ message: 'Username ya registrado' });
        }

        // Crea un nuevo usuario
        const newUser = await Usuario.create({
            username: username,
            email: email,
            password: password,
            id_rol: id_rol
        });

        return res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario: {
                id_usuario: newUser.id_usuario,
                username: newUser.username,
                email: newUser.email,
                rol: newUser.id_rol
            }
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email y password son requeridos' 
            });
        }

        // Busca al usuario por email
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
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verifica la contraseña
        const isValidPassword = await usuario.validarPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Genera un token JWT
        const token = jwt.sign({ id_usuario: usuario.id_usuario, email: usuario.email, rol: usuario.id_rol}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN});

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token: token,
            usuario: {
                id_usuario: usuario.id_usuario,
                username: usuario.username,
                email: usuario.email,
                rol: usuario.Rol.nombre
            }
        });
    } catch (error) {

    }
}

const getProfile = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id_usuario, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Rol,
                    attributes: ['nombre']
                }
            ]
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.status(200).json({ usuario });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// LOGOUT DESDE EL FRONTEND

module.exports = {
    signup,
    login,
    getProfile
}