/**
 * PICK&PLAY - CONTROLADOR DE CARRITO DE COMPRAS
 * 
 * @description Módulo principal del carrito de compras que gestiona la visualización,
 *              modificación y procesamiento de productos seleccionados por el cliente.
 *              Controla todo el flujo desde la revisión hasta la confirmación del pedido.
 * 
 * @features    - Gestión completa del carrito de compras
 *              - Modificación de cantidades y eliminación de productos
 *              - Cálculo automático de totales y subtotales
 *              - Validación de formulario de checkout
 *              - Integración con métodos de pago
 *              - Procesamiento y envío de pedidos a la API
 *              - Estados de carga y feedback visual
 *              - Persistencia en localStorage
 * 
 * @business    El carrito es el componente central del proceso de compra,
 *              donde el cliente revisa y confirma su selección antes del pago.
 *              Su correcto funcionamiento es crítico para completar transacciones
 *              y generar ingresos para el negocio.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

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

/**
 * Inicializa la página del carrito de compras
 * @description Configuración principal, verificación de datos y carga inicial
 * @listens DOMContentLoaded
 */
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

/**
 * Verifica que existan los datos necesarios para operar el carrito
 * @returns {boolean} true si los datos son válidos, false si hay error
 * @description Valida nombre de cliente y redirige si faltan datos críticos
 */
function verificarDatosIniciales() {
    // Verificar nombre de cliente
    nombreCliente = localStorage.getItem('nombreCliente');
    if (!nombreCliente) {
        console.error('No hay nombre de cliente');
        mostrarToast('Debes ingresar tu nombre primero', 'error');
        setTimeout(() => {
            location.assign('/frontend/html/views/index.html');
        }, 2000);
        return false;
    }

    console.log(`Cliente verificado: ${nombreCliente}`);
    return true;
}

/**
 * Configura los elementos iniciales de la interfaz de usuario
 * @description Personaliza la UI con datos del cliente y configuraciones iniciales
 */
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

/**
 * Configura todos los event listeners de la interfaz
 * @description Establece la comunicación entre elementos DOM y funcionalidades
 */
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

/**
 * Carga todos los datos necesarios para el funcionamiento del carrito
 * @async
 * @description Obtiene carrito del localStorage y métodos de pago de la API
 */
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

/**
 * Carga los productos del carrito desde el localStorage
 * @description Recupera y procesa los items previamente guardados
 */
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

/**
 * Obtiene los métodos de pago disponibles desde la API
 * @async
 * @description Carga opciones de pago activas para el formulario de checkout
 */
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

/**
 * Renderiza las opciones de métodos de pago en el select
 * @description Pobla el dropdown con los métodos de pago disponibles
 */
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

/**
 * Renderiza todos los productos del carrito en la interfaz
 * @description Crea elementos DOM para cada producto con controles de cantidad
 * @business Visualización clara de la selección para confirmación del cliente
 */
function renderizarCarrito() {
    if (!elementos.productosCarrito) return;

    elementos.productosCarrito.innerHTML = '';

    carritoItems.forEach((item, index) => {
        const itemElement = crearElementoProductoCarrito(item, index);
        elementos.productosCarrito.appendChild(itemElement);
    });

    console.log(` ${carritoItems.length} productos renderizados en carrito`);
}

/**
 * Crea el elemento DOM para un producto individual del carrito
 * @param {Object} item - Datos del producto
 * @param {number} index - Índice del producto en el array
 * @returns {HTMLElement} Elemento DOM del producto
 * @description Genera la estructura HTML completa con controles y precios
 */
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

/**
 * Modifica la cantidad de un producto en el carrito
 * @param {number} index - Índice del producto en el array
 * @param {number} cambio - Cambio en la cantidad (+1 o -1)
 * @description Función global para controles de cantidad con validaciones
 * @global
 */
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

/**
 * Elimina un producto completamente del carrito
 * @param {number} index - Índice del producto a eliminar
 * @description Función global para eliminación con actualización de UI
 * @global
 */
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

/**
 * Calcula y actualiza el resumen de totales del carrito
 * @description Recalcula cantidades y precios totales mostrando información actualizada
 * @business Información crítica para la decisión de compra del cliente
 */
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

/**
 * Redirige a la página de categorías para agregar más productos
 * @description Permite al cliente continuar comprando manteniendo el carrito actual
 * @business Facilita la venta cruzada y aumenta el ticket promedio
 */
function irAgregarMasProductos() {
    // Guardar carrito actual
    guardarCarritoEnLocalStorage();

    mostrarToast('Redirigiendo a categorías...', 'info');

    setTimeout(() => {
        location.assign('/frontend/html/views/categorias.html');
    }, 1000);
}

/**
 * Cancela la compra actual y limpia todos los datos
 * @description Abandona el proceso de compra y vuelve al inicio
 */
function cancelarCompra() {
    // Limpiar todo el localStorage relacionado al carrito
    localStorage.removeItem('carrito');
    localStorage.removeItem('nombreCliente');
    localStorage.removeItem('categoriaSeleccionada');
    localStorage.removeItem('nombreCategoria');

    mostrarToast('Compra cancelada', 'info');

    setTimeout(() => {
        location.assign('/frontend/html/views/index.html');
    }, 1000);
}

/**
 * Redirige directamente a la página de categorías
 * @description Navegación simple para selección de categorías
 */
function irACategorias() {
    location.assign('/frontend/html/views/categorias.html');
}

/**
 * Procesa y envía el pedido final a la API
 * @async
 * @param {Event} event - Evento del formulario
 * @description Valida datos, crea el pedido y redirige al ticket
 * @business Punto crítico de conversión donde se completa la venta
 */
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
            location.assign(`/frontend/html/views/ticket.html?pedido=${pedidoId}`);
        }, 2000);

    } catch (error) {
        console.error('Error procesando pedido:', error);
        mostrarToast('Error al procesar el pedido. Intenta nuevamente.', 'error');
        mostrarEstado('contenido');
    }
}

/**
 * Valida que el formulario de checkout esté completo
 * @returns {boolean} true si es válido, false si hay errores
 * @description Verifica método de pago y productos en carrito
 */
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

/**
 * Prepara los datos del pedido para envío a la API
 * @returns {Object} Objeto con datos estructurados del pedido
 * @description Formatea los datos según el esquema esperado por el backend
 */
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

/**
 * Gestiona los diferentes estados visuales de la página
 * @param {string} estado - Estado a mostrar
 * @description Controla la visibilidad de elementos según el estado actual
 */
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

/**
 * Muestra un estado de error en la interfaz
 * @description Configura la UI para mostrar mensajes de error
 */
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

/**
 * Guarda el estado actual del carrito en localStorage
 * @description Persiste los datos para mantener el carrito entre sesiones
 */
function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carritoItems));
}

/**
 * Obtiene el icono apropiado según el tipo de método de pago
 * @param {string} tipo - Tipo de método de pago
 * @returns {string} Clase de icono Bootstrap
 * @description Proporciona iconos visuales para diferentes métodos de pago
 */
function getIconoTipo(tipo) {
    const iconos = {
        success: 'check-circle-fill',
        error: 'exclamation-triangle-fill',
        warning: 'exclamation-triangle-fill',
        info: 'info-circle-fill'
    };
    return iconos[tipo] || iconos.info;
}
