const jwt  = require('jsonwebtoken');
const { Usuario } = require('../models/associations.js');
const { secret } = require('../config/jwt.config.js');
require('dotenv').config();

const verificarToken = async (req, res, next) => {
    try {
        // Extrae el token
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        // Verifica y decodifica el token usando la clave secreta
        const decoded = jwt.verify(token, secret);
        
        // Busca al usuario en la base de datos usando el ID del token
        const usuario = await Usuario.findByPk(decoded.id_usuario);

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Adjunta los datos del usuario al request para usar en otros middlewares
        req.usuario = usuario;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token no válido o expirado' });
    }
}


// 3:10