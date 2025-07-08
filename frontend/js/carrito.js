// VARIABLES GLOBALES
let carritoItems = [];
let metodoPagoData = [];
let nombreCliente = '';

// ELEMENTOS DEL DOM
const elementos = {
    // Estados del carrito
    loadingCarrito: document.getElementById('loading-carrito'),
    carritoVacio: document.getElementById('carrito-vacio'),
    carritoContenido: document.getElementById('carrito-contenido'),
    procesandoPedido: document.getElementById('procesando-pedido'),

    // Contenedores de productos
    productosCarrito: document.getElementById('productos-carrito'),

    // Resumen
    totalProductos: document.getElementById('total-productos'),
    totalCarrito: document.getElementById('total-carrito'),

    // Form y botones
    checkoutForm: document.getElementById('checkout-form'),
    nombreClienteInput: document.getElementById('nombre-cliente'),
    metodoPagoSelect: document.getElementById('metodo-pago'),
    btnConfirmarPedido: document.getElementById('btn-confirmar-pedido'),

    // Navegación
    btnAgregarMas: document.getElementById('btn-agregar-mas'),
    btnCancelarCompra: document.getElementById('btn-cancelar-compra'),
    btnIrCategorias: document.getElementById('btn-ir-categorias'),

    // Navbar
    saludoCliente: document.getElementById('saludo-cliente')
};

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando página del carrito...');

    try {
        // Verificar datos iniciales
        if (!verificarDatosIniciales()) {
            return; // Se redirige automáticamente
        }

        // Configurar UI inicial
        configurarUIInicial();

        // Configurar eventos
        configurarEventos();

        // Cargar datos desde localStorage y API
        await cargarDatosIniciales();

        console.log('Carrito inicializado correctamente');

    } catch (error) {
        console.error('Error inicializando carrito:', error);
        mostrarToast('Error cargando el carrito', 'error');
        mostrarEstadoError();
    }
});

// VERIFICACIÓN INICIAL
function verificarDatosIniciales() {
    // Verificar nombre de cliente
    nombreCliente = localStorage.getItem('nombreCliente');
    if (!nombreCliente) {
        console.error('No hay nombre de cliente');
        mostrarToast('Debes ingresar tu nombre primero', 'error');
        setTimeout(() => {
            window.location.href = '/frontend/html/index.html';
        }, 2000);
        return false;
    }

    console.log(`Cliente verificado: ${nombreCliente}`);
    return true;
}

function configurarUIInicial() {
    // Mostrar saludo personalizado
    if (elementos.saludoCliente) {
        elementos.saludoCliente.textContent = `¡Hola, ${nombreCliente}!`;
    }

    // Configurar input readonly del cliente
    if (elementos.nombreClienteInput) {
        elementos.nombreClienteInput.value = nombreCliente;
    }

    console.log(' UI inicial configurada');
}

// CONFIGURACIÓN DE EVENTOS
function configurarEventos() {
    // Botón agregar más productos
    if (elementos.btnAgregarMas) {
        elementos.btnAgregarMas.addEventListener('click', irAgregarMasProductos);
    }

    // Botón cancelar compra
    if (elementos.btnCancelarCompra) {
        elementos.btnCancelarCompra.addEventListener('click', cancelarCompra);
    }

    // Botón ir a categorías (desde carrito vacío)
    if (elementos.btnIrCategorias) {
        elementos.btnIrCategorias.addEventListener('click', irACategorias);
    }

    // Form de checkout
    if (elementos.checkoutForm) {
        elementos.checkoutForm.addEventListener('submit', procesarPedido);
    }

    console.log('Eventos configurados');
}

// CARGA DE DATOS
async function cargarDatosIniciales() {
    mostrarEstado('loading');

    try {
        // Cargar carrito desde localStorage
        cargarCarritoDesdeLocalStorage();

        // Cargar métodos de pago desde API
        await cargarMetodosPago();

        // Mostrar estado apropiado
        if (carritoItems.length === 0) {
            mostrarEstado('vacio');
        } else {
            mostrarEstado('contenido');
            renderizarCarrito();
            actualizarResumen();
        }

    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarEstadoError();
    }
}

function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');

    if (carritoGuardado) {
        try {
            carritoItems = JSON.parse(carritoGuardado);
            console.log(`Carrito cargado: ${carritoItems.length} items`);
        } catch (error) {
            console.error('Error parseando carrito:', error);
            carritoItems = [];
            localStorage.removeItem('carrito');
        }
    } else {
        carritoItems = [];
        console.log('Carrito vacío');
    }
}

async function cargarMetodosPago() {
    try {
        console.log(' Cargando métodos de pago...');

        // Usar el ApiClient global
        const response = await window.ApiClient.getMetodosPagoActivos();
        metodoPagoData = response;

        // Renderizar opciones en el select
        renderizarMetodosPago();

        console.log(`${metodoPagoData.length} métodos de pago cargados`);

    } catch (error) {
        console.error(' Error cargando métodos de pago:', error);
        mostrarToast('Error cargando métodos de pago', 'error');

        // Fallback - métodos básicos
        metodoPagoData = [
            { id_metodopago: 1, nombre: 'Efectivo' },
            { id_metodopago: 2, nombre: 'Tarjeta de Débito' }
        ];
        renderizarMetodosPago();
    }
}

function renderizarMetodosPago() {
    if (!elementos.metodoPagoSelect) return;

    // Limpiar opciones existentes (mantener la primera)
    elementos.metodoPagoSelect.innerHTML = '<option value="">Selecciona un método de pago</option>';

    // Agregar métodos de pago
    metodoPagoData.forEach(metodo => {
        const option = document.createElement('option');
        option.value = metodo.id_metodopago;
        option.textContent = metodo.nombre;
        elementos.metodoPagoSelect.appendChild(option);
    });
}

// RENDERIZADO DEL CARRITO
function renderizarCarrito() {
    if (!elementos.productosCarrito) return;

    elementos.productosCarrito.innerHTML = '';

    carritoItems.forEach((item, index) => {
        const itemElement = crearElementoProductoCarrito(item, index);
        elementos.productosCarrito.appendChild(itemElement);
    });

    console.log(` ${carritoItems.length} productos renderizados en carrito`);
}

function crearElementoProductoCarrito(item, index) {
    const div = document.createElement('div');
    div.className = 'producto-carrito-item';

    // Formatear precio
    const precioUnitario = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(item.precio);

    const subtotal = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(item.precio * item.cantidad);

    div.innerHTML = `
        <div class="row align-items-center">
            <!-- Imagen del producto -->
            <div class="col-auto">
                <img src="/backend/src/img/productos/${item.imagen}" 
                class="producto-carrito-img" alt="${item.nombre}"
                onerror="this.src='/backend/src/img/productos/default.jpg'">
            </div>
            
            <!-- Info del producto -->
            <div class="col">
                <div class="producto-carrito-info">
                    <h6 class="mb-1">${item.nombre}</h6>
                    <p class="text-muted small mb-1">${item.descripcion || 'Sin descripción'}</p>
                    <div class="producto-precio-carrito">${precioUnitario} c/u</div>
                </div>
            </div>
            
            <!-- Controles de cantidad -->
            <div class="col-auto">
                <div class="cantidad-controls">
                    <button class="cantidad-btn-carrito" onclick="cambiarCantidadCarrito(${index}, -1)">
                        <i class="bi bi-dash"></i>
                    </button>
                    <span class="cantidad-display">${item.cantidad}</span>
                    <button class="cantidad-btn-carrito" onclick="cambiarCantidadCarrito(${index}, 1)">
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
            </div>
            
            <!-- Subtotal y eliminar -->
            <div class="col-auto text-end">
                <div class="fw-bold text-brown mb-1">${subtotal}</div>
                <button class="btn btn-eliminar-producto" onclick="eliminarProductoCarrito(${index})" title="Eliminar producto">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        </div>
    `;

    return div;
}

// FUNCIONES GLOBALES PARA ONCLICK
window.cambiarCantidadCarrito = function (index, cambio) {
    if (index < 0 || index >= carritoItems.length) return;

    const item = carritoItems[index];
    const nuevaCantidad = item.cantidad + cambio;

    // Validar límites
    if (nuevaCantidad < 1) {
        // Si baja de 1, eliminar producto
        eliminarProductoCarrito(index);
        return;
    }

    if (nuevaCantidad > 10) {
        mostrarToast('Cantidad máxima: 10 unidades', 'warning');
        return;
    }

    // Actualizar cantidad
    item.cantidad = nuevaCantidad;

    // Re-renderizar y actualizar
    renderizarCarrito();
    actualizarResumen();
    guardarCarritoEnLocalStorage();

    // Feedback visual
    mostrarToast(`Cantidad actualizada: ${item.nombre} (${item.cantidad})`, 'info');

    console.log(`Cantidad actualizada: ${item.nombre} = ${item.cantidad}`);
};

window.eliminarProductoCarrito = function (index) {
    if (index < 0 || index >= carritoItems.length) return;

    const item = carritoItems[index];

    // Eliminar del array
    carritoItems.splice(index, 1);

    // Actualizar UI
    if (carritoItems.length === 0) {
        mostrarEstado('vacio');
    } else {
        renderizarCarrito();
        actualizarResumen();
    }

    // Guardar en localStorage
    guardarCarritoEnLocalStorage();

    // Feedback
    mostrarToast(`${item.nombre} eliminado del carrito`, 'info');

    console.log(`Producto eliminado: ${item.nombre}`);
};

// ACTUALIZACIÓN DE RESUMEN
function actualizarResumen() {
    const totalItems = carritoItems.reduce((total, item) => total + item.cantidad, 0);
    const totalPrecio = carritoItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);

    // Actualizar elementos
    if (elementos.totalProductos) {
        elementos.totalProductos.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }

    if (elementos.totalCarrito) {
        const totalFormateado = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(totalPrecio);

        elementos.totalCarrito.textContent = totalFormateado;
    }

    console.log(` Resumen actualizado: ${totalItems} items, ${totalPrecio}`);
}

// NAVEGACIÓN
function irAgregarMasProductos() {
    // Guardar carrito actual
    guardarCarritoEnLocalStorage();

    mostrarToast('Redirigiendo a categorías...', 'info');

    setTimeout(() => {
        window.location.href = '/frontend/html/categorias.html';
    }, 1000);
}

function cancelarCompra() {
    // Limpiar todo el localStorage relacionado al carrito
    localStorage.removeItem('carrito');
    localStorage.removeItem('nombreCliente');
    localStorage.removeItem('categoriaSeleccionada');
    localStorage.removeItem('nombreCategoria');

    mostrarToast('Compra cancelada', 'info');

    setTimeout(() => {
        window.location.href = '/frontend/html/index.html';
    }, 1000);
}

function irACategorias() {
    window.location.href = '/frontend/html/categorias.html';
}

// PROCESAMIENTO DE PEDIDO
async function procesarPedido(event) {
    event.preventDefault();

    try {
        // Validar datos
        if (!validarFormulario()) {
            return;
        }

        // Mostrar estado de procesamiento
        mostrarEstado('procesando');

        // Preparar datos del pedido
        const datosPedido = prepararDatosPedido();

        console.log('Enviando pedido:', datosPedido);

        // Enviar al backend
        const response = await window.ApiClient.crearPedido(datosPedido);

        console.log('Pedido creado:', response);

        const pedidoId = response.pedido?.id_pedido;
        
        if (!pedidoId) {
            console.error('No se pudo obtener el ID del pedido:', response);
            throw new Error('No se pudo obtener el ID del pedido');
        }

        console.log(`ID del pedido para ticket: ${pedidoId}`);

        // Limpiar carrito
        carritoItems = [];
        localStorage.removeItem('carrito');

        // Redirigir al ticket con el ID del pedido
        setTimeout(() => {
            window.location.href = `/frontend/html/ticket.html?pedido=${pedidoId}`;
        }, 2000);

    } catch (error) {
        console.error('Error procesando pedido:', error);
        mostrarToast('Error al procesar el pedido. Intenta nuevamente.', 'error');
        mostrarEstado('contenido');
    }
}

function validarFormulario() {
    const metodoPago = elementos.metodoPagoSelect.value;

    if (!metodoPago) {
        elementos.metodoPagoSelect.classList.add('is-invalid');
        mostrarToast('Selecciona un método de pago', 'error');
        return false;
    }

    if (carritoItems.length === 0) {
        mostrarToast('El carrito está vacío', 'error');
        return false;
    }

    // Limpiar validaciones
    elementos.metodoPagoSelect.classList.remove('is-invalid');

    return true;
}

function prepararDatosPedido() {
    return {
        nombre_cliente: nombreCliente,
        id_metodopago: parseInt(elementos.metodoPagoSelect.value),
        detallesPedido: carritoItems.map(item => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad
        }))
    };
}

// GESTIÓN DE ESTADOS
function mostrarEstado(estado) {
    // Ocultar todos los estados
    elementos.loadingCarrito?.classList.add('d-none');
    elementos.carritoVacio?.classList.add('d-none');
    elementos.carritoContenido?.classList.add('d-none');
    elementos.procesandoPedido?.classList.add('d-none');

    // Mostrar el estado solicitado
    switch (estado) {
        case 'loading':
            elementos.loadingCarrito?.classList.remove('d-none');
            break;
        case 'vacio':
            elementos.carritoVacio?.classList.remove('d-none');
            break;
        case 'contenido':
            elementos.carritoContenido?.classList.remove('d-none');
            break;
        case 'procesando':
            elementos.procesandoPedido?.classList.remove('d-none');
            break;
    }

    console.log(`Estado cambiado a: ${estado}`);
}

function mostrarEstadoError() {
    if (elementos.carritoContenido) {
        elementos.carritoContenido.innerHTML = `
            <div class="text-center p-5">
                <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 3rem;"></i>
                <h4 class="mt-3 text-danger">Error cargando el carrito</h4>
                <p class="text-muted">No se pudo cargar el carrito. Verifica tu conexión.</p>
                <button class="btn btn-brown" onclick="location.reload()">
                    <i class="bi bi-arrow-clockwise me-2"></i>
                    Reintentar
                </button>
            </div>
        `;
        elementos.carritoContenido.classList.remove('d-none');
    }
}

// UTILIDADES
function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carritoItems));
}

function getIconoTipo(tipo) {
    const iconos = {
        success: 'check-circle-fill',
        error: 'exclamation-triangle-fill',
        warning: 'exclamation-triangle-fill',
        info: 'info-circle-fill'
    };
    return iconos[tipo] || iconos.info;
}
