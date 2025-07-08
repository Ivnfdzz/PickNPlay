/**
 * PICK&PLAY - CONTROLADOR DE PÁGINA DE INICIO
 * 
 * @description Módulo responsable de la página principal de bienvenida donde
 *              los clientes ingresan su nombre para iniciar el proceso de compra.
 *              Incluye funcionalidades especiales de acceso administrativo.
 * 
 * @features    - Captura y validación de nombre del cliente
 *              - Integración con teclado virtual para autoservicio
 *              - Validaciones avanzadas de entrada de texto
 *              - Acceso secreto al panel administrativo (5 clicks en logo)
 *              - Feedback visual y manejo de errores
 *              - Navegación automática al flujo de compra
 * 
 * @business    La página de inicio es el primer punto de contacto con el cliente,
 *              estableciendo una experiencia personalizada desde el comienzo.
 *              El registro del nombre permite un trato personalizado durante
 *              todo el proceso de compra.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Inicializa la página de inicio con todas sus funcionalidades
 * @description Configura formulario, teclado virtual y easter egg administrativo
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const inputNombre = document.getElementById('nombreCliente');
    const logo = document.querySelector('.navbar-brand');
    
    // Inicializar teclado virtual
    if (inputNombre) {
        TecladoVirtual.init(inputNombre);
    }
    
    let clickCount = 0;
    let clickTimer = null;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const nombre = inputNombre.value.trim();

        if (!validarNombre(nombre)) {
            return;
        }

        localStorage.setItem("nombreCliente", nombre);

        location.assign("/frontend/html/views/categorias.html");
    });

    // Funcionalidad secreta para acceso admin
    logo.addEventListener('click', function (e) {
        e.preventDefault(); // Evita la navegación normal del enlace
        
        clickCount++;
        
        // Reiniciar contador después de 3 segundos si no se completan los 5 clicks
        if (clickTimer) {
            clearTimeout(clickTimer);
        }
        
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 3000);

        // Feedback visual sutil para el desarrollador/admin
        if (clickCount >= 3) {
            logo.style.transform = 'scale(1.1)';
            setTimeout(() => {
                logo.style.transform = 'scale(1)';
            }, 150);
        }

        // Si se hacen 5 clicks, redirigir al login
        if (clickCount === 5) {
            clearTimeout(clickTimer);
            clickCount = 0;

            location.assign("/frontend/html/admin/login.html");            
        }
    });
});

/**
 * Valida que el nombre ingresado cumpla con todos los requisitos
 * @param {string} nombre - Nombre ingresado por el usuario
 * @returns {boolean} true si es válido, false si hay errores
 * @description Aplica validaciones comprehensivas de formato y contenido
 * @business Asegura que el nombre sea apropiado para personalización
 */
function validarNombre(nombre) {
    const inputNombre = document.getElementById('nombreCliente');

    // Verificar que no esté vacío
    if (nombre === "" || nombre.length === 0) {
        inputNombre.classList.add('is-invalid');
        mostrarToast("Por favor, ingresa un nombre.", 'info');
        return false;
    }

    // Verificar que tenga más de 2 caracteres
    if (nombre.length < 3) {
        inputNombre.classList.add('is-invalid');
        mostrarToast("El nombre debe tener al menos 3 caracteres.", 'info');
        return false;
    }

    // Verificar que solo contenga letras y espacios
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regex.test(nombre)) {
        inputNombre.classList.add('is-invalid');
        mostrarToast("El nombre solo puede contener letras y espacios.", 'info');
        return false;
    }

    // Verificar que no sea solo espacios
    if (nombre.replace(/\s/g, '').length === 0) {
        inputNombre.classList.add('is-invalid');
        mostrarToast("El nombre no puede estar compuesto solo por espacios.", 'info');
        return false;
    }

    // Si pasa todas las validaciones, remover clase invalid
    inputNombre.classList.remove('is-invalid');
    return true;
}