const Usuario = require('../models/usuario.model.js');
const Rol = require('../models/rol.model.js');

class UsuarioService{
    static async obtenerTodos() {
        return await Usuario.findAll({
            include: this._getIncludeRol(),
            attributes: { exclude: ['password'] }
        });
    }

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

    static async actualizar(id, data) {
        // Validar que el usuario existe
        await this.obtenerPorId(id); // Lanza error si no existe

        // Si se está actualizando el rol, validarlo
        if (data.id_rol) {
            await this._validarRolExiste(data.id_rol);
        }

        // Si se está actualizando email o username, validar únicos
        if (data.email || data.username) {
            await this._validarUsuarioUnicoParaActualizacion(id, data.email, data.username);
        }

        const [filasAfectadas] = await Usuario.update(data, {
            where: { id_usuario: id }
        });

        if (filasAfectadas === 0) {
            throw new Error('Usuario no encontrado');
        }

        return 'Usuario actualizado correctamente';
    }

    static async eliminar(id) {
        // Validar que el usuario existe
        await this.obtenerPorId(id); // Lanza error si no existe

        const filasAfectadas = await Usuario.destroy({
            where: { id_usuario: id }
        });

        if (filasAfectadas === 0) {
            throw new Error('Usuario no encontrado');
        }

        return 'Usuario eliminado correctamente';
    }

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

    static _getIncludeRol() {
        return [
            {
                model: Rol,
                attributes: ['nombre']
            }
        ];
    }

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

    static async _validarRolExiste(id_rol) {
        const rol = await Rol.findByPk(id_rol);
        if (!rol) {
            throw new Error(`Rol con ID ${id_rol} no encontrado`);
        }
        return rol;
    }

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

    static async _validarUsuarioUnicoParaActualizacion(userId, email, username) {
        if (email) {
            const existingEmail = await Usuario.findOne({ 
                where: { 
                    email,
                    id_usuario: { [Usuario.sequelize.Op.ne]: userId }
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
                    id_usuario: { [Usuario.sequelize.Op.ne]: userId }
                } 
            });
            if (existingUsername) {
                throw new Error('Username ya registrado');
            }
        }
    }
}

module.exports = UsuarioService;