/**
 * @fileoverview Modelo de Usuario para el sistema Pick&Play
 * 
 * Define la estructura y comportamiento de los usuarios administrativos del sistema.
 * Incluye encriptación automática de contraseñas, validaciones de datos y métodos
 * de autenticación seguros usando bcrypt.
 * 
 * Los usuarios pueden tener roles: root, analista o repositor (por defecto).
 * Solo usuarios autenticados pueden acceder al panel administrativo.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');
const bcrypt = require('bcryptjs');

/**
 * Modelo Usuario - Representa los usuarios administrativos del sistema
 * 
 * @class Usuario
 * @description Maneja la autenticación y autorización de usuarios del panel administrativo.
 * Incluye encriptación automática de contraseñas y validaciones de seguridad.
 */
const Usuario = DB.define('Usuario', {
    /**
     * Identificador único del usuario
     * @type {number}
     * @primaryKey
     * @autoIncrement
     */
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Nombre de usuario único para autenticación
     * @type {string}
     * @required
     * @unique
     */
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
            notEmpty: {
                msg: 'El nombre de usuario no puede estar vacío'
            },
        }
    },

    /**
     * Dirección de correo electrónico del usuario
     * @type {string}
     * @required
     * @unique
     * @format email
     */
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'El email debe ser un formato válido: example@domain.com'
            },
            notEmpty: {
                msg: 'El email no puede estar vacío'
            }
        }
    },

    /**
     * Contraseña encriptada del usuario
     * Se encripta automáticamente antes de guardar usando bcrypt con salt de 12 rounds
     * @type {string}
     * @required
     * @encrypted
     */
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty:{
                msg: 'La contraseña no puede estar vacía'
            }
        },
    },

    /**
     * Fecha y hora de registro del usuario
     * Se establece automáticamente al crear el usuario
     * @type {Date}
     * @default NOW()
     */
    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    /**
     * Clave foránea al rol del usuario
     * Determina los permisos del usuario en el sistema
     * @type {number}
     * @required
     * @default 3 (rol repositor - menor privilegio)
     * @references rol.id_rol
     */
    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3, // Por defecto rol 'repositor' (menor privilegio)
        references: {
            model: 'rol',
            key: 'id_rol'
        }
    }
},
    {
        tableName: 'usuarios',
        timestamps: false, // No usar createdAt/updatedAt automáticos (usamos fecha_registro)
        
        /**
         * Hooks de Sequelize para encriptación automática de contraseñas
         * Garantiza que las contraseñas nunca se almacenen en texto plano
         */
        hooks: {
            /**
             * Hook ejecutado antes de crear un nuevo usuario
             * Encripta la contraseña usando bcrypt con salt de 12 rounds
             * @param {Usuario} usuario - Instancia del usuario a crear
             */
            beforeCreate: async (usuario) => {
                if (usuario.password){
                    const salt = await bcrypt.genSalt(12);
                    usuario.password = await bcrypt.hash(usuario.password, salt);
                }
            },
            
            /**
             * Hook ejecutado antes de actualizar un usuario existente
             * Solo re-encripta la contraseña si fue modificada
             * @param {Usuario} usuario - Instancia del usuario a actualizar
             */
            beforeUpdate: async (usuario) => {
                if (usuario.changed('password')) {
                    const salt = await bcrypt.genSalt(12);
                    usuario.password = await bcrypt.hash(usuario.password, salt);
                }
            }
        }
    }
);

/**
 * Método de instancia para validar contraseñas
 * 
 * Compara una contraseña en texto plano con la contraseña encriptada almacenada
 * en la base de datos. Utilizado durante el proceso de autenticación.
 * 
 * @method validarPassword
 * @param {string} password - Contraseña en texto plano a validar
 * @returns {Promise<boolean>} - true si la contraseña coincide, false si no
 * @example
 * const usuario = await Usuario.findOne({ where: { email: 'admin@example.com' } });
 * const esValida = await usuario.validarPassword('miPassword123');
 * if (esValida) {
 *   // Autenticación exitosa
 * }
 */
Usuario.prototype.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

/**
 * Exporta el modelo Usuario para uso en otras partes de la aplicación
 * Se utiliza principalmente en servicios de autenticación y controladores de usuario
 */
module.exports = Usuario;