const MetodoPago = require('../models/metodoPago.model.js');

const crearMetodosPago = async () => {
    try {
        const metodosExistentes = await MetodoPago.count();
        if (metodosExistentes > 0) {
            console.log('Métodos de pago ya existen, saltando...');
            return;
        }

        await MetodoPago.bulkCreate([
            { nombre: 'Efectivo', activo: true },
            { nombre: 'Tarjeta de Débito', activo: true },
            { nombre: 'Tarjeta de Crédito', activo: true },
            { nombre: 'Transferencia Bancaria', activo: true },
            { nombre: 'MercadoPago', activo: true },
            { nombre: 'Modo', activo: false },
            { nombre: 'PayPal', activo: true },
            { nombre: 'QR', activo: false }
        ]);

        console.log('Métodos de pago creados');
    } catch (error) {
        console.error('Error creando métodos de pago:', error);
    }
};

module.exports = crearMetodosPago;