/**
 * PICK&PLAY - SISTEMA DE NOTIFICACIONES TOAST
 * 
 * @description Módulo responsable de la gestión de notificaciones toast en toda la aplicación.
 *              Proporciona un sistema centralizado para mostrar mensajes informativos, de éxito,
 *              advertencia y error con estilo Bootstrap y comportamiento consistente.
 * 
 * @features    - Creación automática del contenedor de toasts
 *              - Soporte para múltiples tipos de notificación (success, error, warning, info)
 *              - Posicionamiento fijo en esquina inferior derecha
 *              - Auto-ocultado con tiempos personalizados por tipo
 *              - Limpieza automática del DOM tras ocultarse
 *              - Integración completa con Bootstrap Toast API
 *              - IDs únicos para evitar conflictos
 * 
 * @business    Las notificaciones toast mejoran significativamente la experiencia del usuario
 *              proporcionando feedback inmediato sobre acciones realizadas, errores encontrados
 *              y estados del sistema de manera no intrusiva.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Muestra una notificación toast con mensaje y tipo específico
 * 
 * @function mostrarToast
 * @param {string} mensaje - Texto del mensaje a mostrar en la notificación
 * @param {string} [tipo="info"] - Tipo de notificación: "success", "error", "warning", "info"
 * @description Función principal para mostrar notificaciones toast. Crea dinámicamente el
 *              contenedor si no existe, aplica estilos según el tipo y configura el
 *              comportamiento de auto-ocultado con limpieza automática del DOM.
 * @business Proporciona feedback inmediato al usuario sobre resultados de acciones
 */
function mostrarToast(mensaje, tipo = "info") {
    // Verificación y creación del contenedor de toasts
    let toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.className =
            "toast-container position-fixed bottom-0 end-0 p-3";
        document.body.appendChild(toastContainer);
    }

    // Configuración de estilos por tipo de notificación
    const tipoClases = {
        success: "bg-success text-white",
        error: "bg-danger text-white",
        warning: "bg-warning text-dark",
        info: "bg-info text-white",
    };
    const clases = tipoClases[tipo] || tipoClases.info;

    // Generación de HTML con ID único
    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div class="toast ${clases}" id="${toastId}" role="alert">
            <div class="toast-body">
                ${mensaje}
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML("beforeend", toastHTML);

    // Inicialización y configuración del toast Bootstrap
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: tipo === "error" ? 4000 : 3000, // Errores se muestran más tiempo
    });
    toast.show();

    // Limpieza automática del DOM tras ocultarse
    toastElement.addEventListener("hidden.bs.toast", () => {
        toastElement.remove();
    });
}

// Exportación global para uso en toda la aplicación
window.mostrarToast = mostrarToast;
