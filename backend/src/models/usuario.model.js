const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');
const bcrypt = require('bcryptjs');

const Usuario = DB.define('Usuario', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

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

    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty:{
                msg: 'La contraseña no puede estar vacía'
            }
        },
    },

    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        references: {
            model: 'rol', // Nombre de la tabla referenciada
            key: 'id_rol' // Clave primaria de la tabla referenciada
        }
    }
},
    {
        tableName: 'usuarios', // Nombre específico de la tabla
        timestamps: false, // Si no quieres createdAt y updatedAt automáticos
        hooks: {
            beforeCreate: async (usuario) => {
                if (usuario.password){
                    const salt = await bcrypt.genSalt(12);
                    usuario.password = await bcrypt.hash(usuario.password, salt);
                }
            },
            beforeUpdate: async (usuario) => {
                if (usuario.changed('password')) {
                    const salt = await bcrypt.genSalt(12);
                    usuario.password = await bcrypt.hash(usuario.password, salt);
                }
            }
        }
    }
);

Usuario.prototype.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = Usuario;