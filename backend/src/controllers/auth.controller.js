const AuthService = require('../services/auth.service.js');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await AuthService.validarCredenciales(email, password);
    
        
        const token = AuthService.generarToken(usuario);
        
        
        const respuesta = AuthService.formatearRespuestaLogin(usuario, token);

        return res.status(200).json(respuesta);
    } catch (error) {
        if (error.message.includes('requeridos') || 
            error.message.includes('inválido') ||
            error.message.includes('no encontrado') ||
            error.message.includes('incorrecta') ||
            error.message.includes('caracteres')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const usuario = await AuthService.obtenerPerfil(req.usuario.id_usuario);
        
        return res.status(200).json({ usuario });
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    login,
    getProfile
};