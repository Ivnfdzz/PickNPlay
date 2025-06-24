const jwt = require('jsonwebtoken');
const { Usuario } = require('../models/usuarioModel.js');
require('dotenv').config();

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Verifica si el usuario ya existe
        const existingUser = await Usuario.findOne({
            where: { email: email } });
        
        if (existingUser) {
            return res.status(400).json({ message: 'Email ya registrado' });
        }
        // Crea un nuevo usuario
        const newUser = await Usuario.create({
            username: username,
            email: email,
            password: password
        });

        return res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
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

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Busca al usuario por email
        const user = await Usuario.findOne({ where: { email: email } });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verifica la contraseña
        const isValidPassword = await user.validarPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Genera un token JWT
        const token = jwt.sign({ id_usuario: user.id_usuario }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: {
                id_usuario: user.id_usuario,
                username: user.username,
                email: user.email,
                rol: user.id_rol
            }
        });
    } catch (error) {
        
    }
}

exports.getProfile = async (req, res) => {
    try {
        const user = await Usuario.findByPk(req.user.id, {
            attributes: {exclude: ['password']}
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//exports.logout = (req, res) => {