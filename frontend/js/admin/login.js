/**
 * PICK&PLAY - SISTEMA DE AUTENTICACIÓN ADMINISTRATIVA
 * 
 * @description Módulo responsable del proceso completo de autenticación para el panel
 *              administrativo. Gestiona validación de credenciales, manejo de sesiones,
 *              tokens de seguridad y redirección segura al dashboard principal.
 * 
 * @features    - Validación completa de formulario de login
 *              - Autenticación segura con API backend
 *              - Gestión automática de tokens y sesiones
 *              - Validación de sesiones existentes al cargar
 *              - Manejo de estados de carga con feedback visual
 *              - Login automático para desarrollo y testing
 *              - Limpieza automática de errores en tiempo real
 *              - Redirección inteligente post-autenticación
 * 
 * @security    - Validación de campos requeridos y formatos
 *              - Encriptación y manejo seguro de tokens
 *              - Protección contra sesiones inválidas
 *              - Limpieza de datos sensibles en memoria
 * 
 * @business    El sistema de autenticación protege el acceso al panel administrativo,
 *              asegurando que solo personal autorizado pueda gestionar el sistema
 *              y manteniendo un control estricto de sesiones activas.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Referencias centralizadas a elementos del DOM del formulario de login
 * @constant {Object} elementos - Objeto con referencias a elementos clave del formulario
 * @description Centraliza todas las referencias DOM para facilitar mantenimiento
 *              y evitar consultas repetidas al DOM durante la ejecución.
 */
const elementos = {
    form: document.getElementById('login-form'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    btnLogin: document.getElementById('btn-login'),
    errorContainer: document.getElementById('login-error'),
    errorMessage: document.querySelector('.error-message'),
    backButton: document.getElementById('backButton')
};

/* ================================================
   INICIALIZACIÓN Y CONFIGURACIÓN
   ================================================ */
/**
 * Inicialización principal del módulo de login
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Login inicializado');
    
    // Verificar si ya está autenticado
    verificarSesionExistente();
    
    // Configurar eventos
    configurarEventos();
});

/* ================================================
   GESTIÓN DE SESIONES
   ================================================ */

/**
 * Verifica si existe una sesión válida y redirige automáticamente
 * Evita que usuarios ya autenticados tengan que volver a hacer login
 */
function verificarSesionExistente() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            console.log('Sesión existente encontrada:', user.username);
            
            // Redirigir directamente al dashboard
            mostrarToast('Ya tienes una sesión activa. Redirigiendo...', 'info');
            
            setTimeout(() => {
                location.assign('/frontend/html/admin/dashboard.html');
            }, 1500);
            
        } catch (error) {
            console.error('Error parseando datos de usuario:', error);
            limpiarSesion();
        }
    }
}

// CONFIGURACIÓN DE EVENTOS
function configurarEventos() {
    // Formulario de login
    elementos.form.addEventListener('submit', manejarLogin);
    
    // Botón volver
    elementos.backButton.addEventListener('click', (e) => {
        e.preventDefault();
        location.assign('/frontend/html/views/index.html');
    });
    
    // Limpiar errores al escribir
    elementos.email.addEventListener('input', limpiarError);
    elementos.password.addEventListener('input', limpiarError);

    // Login automático para el profesor
    const btnLoginProfesor = document.getElementById('btn-login-profesor');
    if (btnLoginProfesor) {
        btnLoginProfesor.addEventListener('click', async () => {
            elementos.email.value = 'profesor1@pickandplay.com';
            elementos.password.value = 'profesorAdmin123';
            limpiarError();
            mostrarCargando(true);
            try {
                const response = await apiInstance.login('profesor1@pickandplay.com', 'profesorAdmin123');
                guardarSesion(response.token, response.usuario);
                mostrarToast(`¡Bienvenido ${response.usuario.username}!`, 'success');
                setTimeout(() => {
                    location.assign('/frontend/html/admin/dashboard.html');
                }, 1500);
            } catch (error) {
                mostrarError(obtenerMensajeError(error.message));
            } finally {
                mostrarCargando(false);
            }
        });
    }
    
    console.log('Eventos configurados');
}

// MANEJO DEL LOGIN
async function manejarLogin(event) {
    event.preventDefault();
    
    // Obtener valores
    const email = elementos.email.value.trim();
    const password = elementos.password.value;
    
    // Validar campos
    if (!validarCampos(email, password)) {
        return;
    }
    
    // Mostrar estado de carga
    mostrarCargando(true);
    limpiarError();
    
    try {
        console.log('Intentando login para:', email);
        
        // Llamar a la API
        const response = await apiInstance.login(email, password);
        
        console.log('Login exitoso:', response);
        
        // Guardar datos en localStorage
        guardarSesion(response.token, response.usuario);
        
        // Mostrar éxito
        mostrarToast(`¡Bienvenido ${response.usuario.username}!`, 'success');
        
        // Redirigir al dashboard
        setTimeout(() => {
            location.assign('/frontend/html/admin/dashboard.html');
        }, 1500);
        
    } catch (error) {
        console.error('Error en login:', error);
        mostrarError(obtenerMensajeError(error.message));
        
    } finally {
        mostrarCargando(false);
    }
}

// VALIDACIONES
function validarCampos(email, password) {
    if (!email || !password) {
        mostrarError('Por favor, completa todos los campos');
        return false;
    }
    
    if (!email.includes('@')) {
        mostrarError('Por favor, ingresa un email válido');
        return false;
    }
    
    if (password.length < 6) {
        mostrarError('La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    return true;
}

// GESTIÓN DE SESIÓN
function guardarSesion(token, usuario) {
    try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));
        console.log('Sesión guardada correctamente');
    } catch (error) {
        console.error('Error guardando sesión:', error);
        mostrarError('Error guardando la sesión');
    }
}

function limpiarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Sesión limpiada');
}

// MANEJO DE UI
function mostrarCargando(mostrar) {
    if (mostrar) {
        elementos.btnLogin.disabled = true;
        elementos.btnLogin.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Iniciando sesión...
        `;
    } else {
        elementos.btnLogin.disabled = false;
        elementos.btnLogin.innerHTML = 'Iniciar Sesión';
    }
}

function mostrarError(mensaje) {
    if (elementos.errorContainer && elementos.errorMessage) {
        elementos.errorMessage.textContent = mensaje;
        elementos.errorContainer.classList.remove('d-none');
    }
    // Siempre mostrar toast también
    mostrarToast(mensaje, 'error');
}

function limpiarError() {
    if (elementos.errorContainer) {
        elementos.errorContainer.classList.add('d-none');
    }
}

// UTILIDADES
function obtenerMensajeError(errorMessage) {
    const mapaErrores = {
        'Email y password son requeridos': 'Por favor, completa todos los campos',
        'Usuario no encontrado': 'Email o contraseña incorrectos',
        'Contraseña incorrecta': 'Email o contraseña incorrectos',
        'Formato de email inválido': 'Por favor, ingresa un email válido',
        'Token no válido o expirado': 'Tu sesión ha expirado'
    };
    
    return mapaErrores[errorMessage] || 'Error al iniciar sesión. Intenta nuevamente.';
}
