// VARIABLES GLOBALES
let pedidoData = null;
let pedidoId = null;

// ELEMENTOS DEL DOM
const elementos = {
    // Estados
    loadingTicket: document.getElementById('loading-ticket'),
    errorTicket: document.getElementById('error-ticket'),
    ticketContenido: document.getElementById('ticket-contenido'),
    
    // Datos del ticket
    numeroPedido: document.getElementById('numero-pedido'),
    fechaPedido: document.getElementById('fecha-pedido'),
    nombreCliente: document.getElementById('nombre-cliente'),
    metodoPago: document.getElementById('metodo-pago'),
    listaProductos: document.getElementById('lista-productos'),
    totalProductos: document.getElementById('total-productos'),
    totalPagado: document.getElementById('total-pagado'),
    
    // Botones
    btnDescargarPdf2: document.getElementById('btn-descargar-pdf-2'),
    btnNuevaCompra: document.getElementById('btn-nueva-compra'),
    btnVolverInicio: document.getElementById('btn-volver-inicio'),
    
    // PDF target
    ticketPdf: document.getElementById('ticket-pdf')
};

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando página del ticket...');
    
    try {
        // Obtener ID del pedido desde URL
        if (!obtenerPedidoId()) {
            return; // Error, se redirige
        }
        
        // Configurar eventos
        configurarEventos();
        
        // Cargar datos del pedido
        await cargarDatosTicket();
        
        console.log('Ticket inicializado correctamente');
        
    } catch (error) {
        console.error('Error inicializando ticket:', error);
        mostrarError();
    }
});

// OBTENER ID DEL PEDIDO
function obtenerPedidoId() {
    const urlParams = new URLSearchParams(window.location.search);
    pedidoId = urlParams.get('pedido');
    
    if (!pedidoId) {
        console.error('No se encontró ID del pedido en URL');
        mostrarToast('No se encontró el pedido solicitado', 'error');
        
        setTimeout(() => {
            location.assign('/frontend/html/views/index.html');
        }, 3000);
        
        return false;
    }
    
    console.log(`ID del pedido: ${pedidoId}`);
    return true;
}

// CONFIGURACIÓN DE EVENTOS
function configurarEventos() {
    // Solo el botón de abajo (que funciona perfecto)
    if (elementos.btnDescargarPdf2) {
        elementos.btnDescargarPdf2.addEventListener('click', descargarPDF);
    }
    
    // Botón nueva compra
    if (elementos.btnNuevaCompra) {
        elementos.btnNuevaCompra.addEventListener('click', nuevaCompra);
    }
    
    // Botón volver al inicio (error state)
    if (elementos.btnVolverInicio) {
        elementos.btnVolverInicio.addEventListener('click', volverInicio);
    }
    
    console.log('Eventos configurados');
}

// CARGA DE DATOS
async function cargarDatosTicket() {
    mostrarEstado('loading');
    
    try {
        console.log(`Cargando pedido ${pedidoId}...`);
        
        pedidoData = await window.ApiClient.getPedido(pedidoId);
        
        if (!pedidoData) {
            throw new Error('No se encontraron datos del pedido');
        }
        
        // Renderizar ticket
        renderizarTicket();
        
        // Mostrar ticket
        mostrarEstado('contenido');
        
        // Limpiar localStorage del carrito (compra completada)
        limpiarDatosCarrito();
        
    } catch (error) {
        console.error('Error cargando datos del pedido:', error);
        mostrarError();
    }
}

// RENDERIZADO DEL TICKET
function renderizarTicket() {
    try {
        // Datos básicos del pedido
        if (elementos.numeroPedido) {
            elementos.numeroPedido.textContent = `#${pedidoData.id_pedido}`;
        }
        
        if (elementos.fechaPedido) {
            let fecha;
            
            // Intentar parsear la fecha (puede venir como fecha ISO o timestamp)
            if (pedidoData.fecha_pedido) {
                fecha = new Date(pedidoData.fecha_pedido);
                
                // Si la fecha es inválida, intentar con fecha alternativa
                if (isNaN(fecha.getTime()) && pedidoData.fecha) {
                    fecha = new Date(pedidoData.fecha);
                }
                
                // Si sigue siendo inválida, usar fecha actual
                if (isNaN(fecha.getTime())) {
                    console.warn('Fecha inválida en pedido, usando fecha actual');
                    fecha = new Date();
                }
            } else {
                // Si no hay fecha, usar actual
                fecha = new Date();
            }
            
            // Formatear fecha correctamente
            elementos.fechaPedido.textContent = fecha.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        if (elementos.nombreCliente) {
            elementos.nombreCliente.textContent = pedidoData.nombre_cliente;
        }
        
        if (elementos.metodoPago) {
            elementos.metodoPago.textContent = pedidoData.MetodoPago?.nombre || 'No especificado';
        }
        
        // Renderizar productos
        renderizarProductos();
        
        // Renderizar totales
        renderizarTotales();
        
        console.log('Ticket renderizado correctamente');
        
    } catch (error) {
        console.error('Error renderizando ticket:', error);
        throw error;
    }
}

function renderizarProductos() {
    if (!elementos.listaProductos || !pedidoData.DetallePedidos) return;
    
    elementos.listaProductos.innerHTML = '';
    
    pedidoData.DetallePedidos.forEach(detalle => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto-ticket-item';
        
        // Formatear precios
        const precioUnitario = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(detalle.precio_unitario);
        
        const subtotal = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS', 
            minimumFractionDigits: 0
        }).format(detalle.precio_unitario * detalle.cantidad);
        
        productoDiv.innerHTML = `
            <div class="producto-ticket-info">
                <h6>${detalle.Producto.nombre}</h6>
                <div class="producto-ticket-cantidad">
                    ${detalle.cantidad} x ${precioUnitario}
                </div>
            </div>
            <div class="producto-ticket-precio">
                ${subtotal}
            </div>
        `;
        
        elementos.listaProductos.appendChild(productoDiv);
    });
}

function renderizarTotales() {
    if (!pedidoData.DetallePedidos) {
        console.error('No hay DetallePedidos en pedidoData:', pedidoData);
        return;
    }
    
    // Calcular totales
    const totalItems = pedidoData.DetallePedidos.reduce((total, detalle) => total + detalle.cantidad, 0);
    const totalPrecio = pedidoData.DetallePedidos.reduce((total, detalle) => 
        total + (detalle.precio_unitario * detalle.cantidad), 0);
    
    // Actualizar elementos
    if (elementos.totalProductos) {
        elementos.totalProductos.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }
    
    if (elementos.totalPagado) {
        const totalFormateado = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(totalPrecio);
        
        elementos.totalPagado.textContent = totalFormateado;
    }
}

// GESTIÓN DE ESTADOS
function mostrarEstado(estado) {
    // Ocultar todos
    elementos.loadingTicket?.classList.add('d-none');
    elementos.errorTicket?.classList.add('d-none');
    elementos.ticketContenido?.classList.add('d-none');
    
    // Mostrar el solicitado
    switch (estado) {
        case 'loading':
            elementos.loadingTicket?.classList.remove('d-none');
            break;
        case 'error':
            elementos.errorTicket?.classList.remove('d-none');
            break;
        case 'contenido':
            elementos.ticketContenido?.classList.remove('d-none');
            break;
    }
    
    console.log(`Estado del ticket: ${estado}`);
}

function mostrarError() {
    mostrarEstado('error');
    mostrarToast('Error cargando el ticket', 'error');
}

// ACCIONES DE NAVEGACIÓN
function nuevaCompra() {
    // Limpiar todo y volver al inicio
    limpiarDatosCarrito();
    
    mostrarToast('Iniciando nueva compra...', 'info');
    
    setTimeout(() => {
        location.assign('/frontend/html/views/index.html');
    }, 1000);
}

function volverInicio() {
    limpiarDatosCarrito();
    location.assign('/frontend/html/views/index.html');
}

function limpiarDatosCarrito() {
    // Limpiar todo el localStorage relacionado
    localStorage.removeItem('carrito');
    localStorage.removeItem('nombreCliente');
    localStorage.removeItem('categoriaSeleccionada');
    localStorage.removeItem('nombreCategoria');
    
    console.log('Datos del carrito limpiados');
}

// GENERACIÓN DE PDF
async function descargarPDF() {
    try {
        mostrarToast('Preparando ticket para descarga...', 'info');
        
        // Cambiar texto del botón
        const botonOriginal = elementos.btnDescargarPdf2;
        const textoOriginal = botonOriginal.innerHTML;
        botonOriginal.innerHTML = '<i class="bi bi-printer me-2"></i>Preparando...';
        botonOriginal.disabled = true;
        
        // Agregar clase especial para impresión
        document.body.classList.add('imprimiendo-ticket');
        
        // Cambiar título temporalmente
        const tituloOriginal = document.title;
        document.title = `Pick&Play - Ticket Pedido #${pedidoId}`;
        
        // Esperar un momento para que se apliquen los estilos
        setTimeout(() => {
            // Abrir diálogo de impresión/PDF
            window.print();
            
            // Restaurar después de imprimir
            setTimeout(() => {
                document.body.classList.remove('imprimiendo-ticket');
                document.title = tituloOriginal;
                
                // Restaurar botón
                botonOriginal.innerHTML = textoOriginal;
                botonOriginal.disabled = false;
                
                mostrarToast('¡Ticket listo! Puedes guardarlo como PDF desde el diálogo de impresión', 'success');
            }, 1000);
        }, 100);
        
        console.log(`Ticket preparado para impresión/PDF`);
        
    } catch (error) {
        console.error('Error preparando impresión:', error);
        
        // Restaurar botón en caso de error
        if (elementos.btnDescargarPdf2) {
            elementos.btnDescargarPdf2.innerHTML = '<i class="bi bi-download me-2"></i>Descargar ticket';
            elementos.btnDescargarPdf2.disabled = false;
        }
        
        mostrarToast('Error preparando descarga. Intenta nuevamente.', 'error');
    }
}