/**
 * @fileoverview Middleware de subida de archivos para Pick&Play.
 * Configura Multer para almacenar imágenes de productos en disco con nombre único.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
    /**
     * Define la carpeta de destino para los archivos subidos.
     * @param {import('express').Request} req - Solicitud HTTP.
     * @param {Express.Multer.File} file - Archivo recibido.
     * @param {Function} cb - Callback de Multer.
     */
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../img/productos'));
    },
    /**
     * Define el nombre del archivo subido (único: fecha + nombre original sin espacios).
     * @param {import('express').Request} req - Solicitud HTTP.
     * @param {Express.Multer.File} file - Archivo recibido.
     * @param {Function} cb - Callback de Multer.
     */
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

module.exports = upload;