/**
 * PICK&PLAY - SISTEMA DE CONTROL DE AUTENTICACIÓN
 * 
 * @description Módulo responsable del control completo de autenticación y autorización
 *              en toda la aplicación. Gestiona sesiones, tokens, permisos por rol
 *              y proporciona una interfaz unificada para el manejo de usuarios
 *              tanto en el frontend cliente como en el panel administrativo.
 * 
 * @features    - Autenticación completa con API backend
 *              - Gestión automática de tokens y sesiones
 *              - Control de permisos basado en roles (root, analista, repositor)
 *              - Validación de sesiones existentes al cargar páginas
 *              - UI adaptativa según estado de autenticación
 *              - Redirección inteligente según permisos de usuario
 *              - Manejo de estados de carga y errores
 *              - Limpieza automática de sesiones inválidas
 * 
 * @security    - Validación de tokens en cada operación crítica
 *              - Protección de rutas administrativas
 *              - Limpieza segura de datos de sesión
 *              - Control de acceso granular por funcionalidad
 * 
 * @business    El control de autenticación es fundamental para proteger el sistema,
 *              asegurar que solo personal autorizado acceda a funciones administrativas
 *              y mantener la seguridad de datos sensibles del negocio.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Controlador principal de autenticación y autorización
 * @class AuthController
 */
class AuthController {
    /**
     * Constructor del controlador de autenticación
     * @description Inicializa el controlador, configura referencias DOM y estado inicial
     * @business Centraliza la gestión de autenticación para toda la aplicación
     */
    constructor() {
        this.elements = {
            // Elementos de login
            loginForm: document.getElementById("login-form"),
            loginEmail: document.getElementById("email"),
            loginPassword: document.getElementById("password"),
            loginError: document.getElementById("login-error"),
            loginButton: document.querySelector('button[type="submit"]'),

            // Elementos comunes
            backButton: document.getElementById("backButton"),
            logoutButton: document.getElementById("logout-button"),
            userInfo: document.getElementById("user-info"),
            userNameDisplay: document.getElementById("user-name"),
            adminItems: document.querySelectorAll(".admin-only"),
        };

        this.currentUser = null;
        this.init();
    }

    // INICIALIZACIÓN

    /**
     * Inicializa el controlador de autenticación
     * @description Configura event listeners y verifica el estado de autenticación actual
     */
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    /**
     * Configura todos los event listeners de la interfaz
     * @description Establece la comunicación entre elementos DOM y funcionalidades de auth
     */
    setupEventListeners() {
        // Formulario de login
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Botón de logout
        if (this.elements.logoutButton) {
            this.elements.logoutButton.addEventListener("click", () => {
                this.handleLogout();
            });
        }

        // Botón de volver
        if (this.elements.backButton) {
            this.elements.backButton.addEventListener("click", () => {
                window.history.back();
            });
        }

        // Limpiar errores en inputs
        if (this.elements.loginEmail) {
            this.elements.loginEmail.addEventListener("input", () => {
                this.clearError();
            });
        }

        if (this.elements.loginPassword) {
            this.elements.loginPassword.addEventListener("input", () => {
                this.clearError();
            });
        }
    }

    // AUTENTICACIÓN PRINCIPAL

    /**
     * Maneja el proceso completo de login de usuario
     * @async
     * @description Valida credenciales, autentica con API, guarda sesión y redirige según permisos
     * @throws {Error} Error de validación o comunicación con API
     * @business Punto de entrada principal para acceso al sistema
     */
    async handleLogin() {
        try {
            const email = this.elements.loginEmail.value.trim();
            const password = this.elements.loginPassword.value;

            // Validaciones básicas
            if (!this.validateLoginInputs(email, password)) {
                return;
            }

            // UI: Mostrar loading
            this.setLoginLoading(true);
            this.clearError();

            // Llamada a la API
            const response = await apiInstance.login(email, password);

            // Guardar sesión
            this.saveSession(response.token, response.usuario);

            // Actualizar UI
            this.currentUser = response.usuario;
            this.updateUIForAuthenticatedUser(response.usuario);

            // Mostrar éxito y redirigir
            this.showSuccess(`¡Bienvenido ${response.usuario.username}!`);

            setTimeout(() => {
                this.redirectToDashboard(response.usuario.rol);
            }, 1500);
        } catch (error) {
            console.error("Error en login:", error);
            this.showError(this.getErrorMessage(error.message));
        } finally {
            this.setLoginLoading(false);
        }
    }

    /**
     * Maneja el proceso de logout del usuario
     * @description Limpia la sesión y redirige al login
     * @business Asegura la terminación segura de sesiones
     */
    handleLogout() {
        this.clearSession();
        mostrarToast("Sesión cerrada correctamente", "info");
        setTimeout(() => {
            location.assign("/frontend/html/admin/login.html");
        }, 1500);
    }

    /**
     * Verifica el estado actual de autenticación del usuario
     * @async
     * @description Valida tokens existentes y actualiza UI según estado de autenticación
     * @business Mantiene la consistencia de sesiones entre recargas de página
     */
    async checkAuthStatus() {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
            try {
                // Verificar que el token sea válido
                await apiInstance.getProfile();

                // Si llegamos aquí, el token es válido
                this.currentUser = JSON.parse(userData);
                this.updateUIForAuthenticatedUser(this.currentUser);

                // Verificar permisos para páginas admin
                if (window.location.pathname.includes("/admin/")) {
                    this.verifyAdminAccess();
                }
            } catch (error) {
                console.error("Token inválido:", error);
                this.clearSession();

                // Si está en página admin, redirigir a login
                if (window.location.pathname.includes("/admin/")) {
                    location.assign("/frontend/html/admin/login.html");
                }
            }
        } else {
            this.updateUIForUnauthenticatedUser();

            // Si está en página admin sin auth, redirigir
            if (window.location.pathname.includes("/admin/")) {
                location.assign("/frontend/html/admin/login.html");
            }
        }
    }

    // GESTIÓN DE SESIÓN

    /**
     * Guarda los datos de sesión en localStorage
     * @param {string} token - Token de autenticación JWT
     * @param {Object} user - Datos del usuario autenticado
     * @description Almacena de forma segura las credenciales de sesión
     */
    saveSession(token, user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    }

    /**
     * Limpia completamente los datos de sesión
     * @description Elimina token, datos de usuario y resetea estado interno
     * @security Asegura limpieza completa de datos sensibles
     */
    clearSession() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.currentUser = null;
    }

    // VERIFICACIONES DE PERMISOS

    /**
     * Verifica si el usuario tiene acceso al panel administrativo
     * @returns {boolean} true si tiene acceso, false si no
     * @description Valida roles administrativos y redirige si es necesario
     * @security Control de acceso crítico para funciones administrativas
     */
    verifyAdminAccess() {
        const userRole = this.currentUser?.rol;

        if (!["root", "analista", "repositor"].includes(userRole)) {
            alert("No tienes permisos para acceder al panel administrativo");
            location.assign("/frontend/html/views/index.html");
            return false;
        }

        return true;
    }

    /**
     * Redirige al usuario al dashboard apropiado según su rol
     * @param {string} userRole - Rol del usuario (root, analista, repositor)
     * @description Dirige al usuario a la interfaz correcta según permisos
     * @business Asegura que cada usuario acceda solo a su área autorizada
     */
    redirectToDashboard(userRole) {
        if (["root", "analista", "repositor"].includes(userRole)) {
            location.assign("/frontend/html/admin/dashboard.html");
        } else {
            this.showError(
                "No tienes permisos para acceder al panel administrativo"
            );
            this.handleLogout();
        }
    }

    // VALIDACIONES

    /**
     * Valida los datos de entrada del formulario de login
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {boolean} true si las validaciones pasan, false si hay errores
     * @description Verifica formato de email y requisitos de contraseña
     */
    validateLoginInputs(email, password) {
        if (!email || !password) {
            this.showError("Por favor, completa todos los campos");
            return false;
        }

        if (!email.includes("@")) {
            this.showError("Por favor, ingresa un email válido");
            return false;
        }

        if (password.length < 6) {
            this.showError("La contraseña debe tener al menos 6 caracteres");
            return false;
        }

        return true;
    }

    // MANEJO DE UI BÁSICO

    /**
     * Actualiza la interfaz para un usuario autenticado
     * @param {Object} user - Datos del usuario autenticado
     * @description Muestra elementos de usuario y configura UI según rol
     * @business Personaliza la experiencia según el perfil del usuario
     */
    updateUIForAuthenticatedUser(user) {
        // Mostrar info del usuario (si los elementos existen)
        if (this.elements.userNameDisplay) {
            this.elements.userNameDisplay.textContent = user.username;
        }

        if (this.elements.userInfo) {
            this.elements.userInfo.classList.remove("d-none");
        }

        // Mostrar elementos admin según rol
        this.showAdminElements(user.rol);

        // Mostrar logout button
        if (this.elements.logoutButton) {
            this.elements.logoutButton.classList.remove("d-none");
        }

        console.log(`Usuario autenticado: ${user.username} (${user.rol})`);
    }

    /**
     * Actualiza la interfaz para un usuario no autenticado
     * @description Oculta elementos de usuario y funcionalidades administrativas
     * @security Asegura que elementos sensibles no sean visibles sin autenticación
     */
    updateUIForUnauthenticatedUser() {
        // Ocultar info del usuario
        if (this.elements.userInfo) {
            this.elements.userInfo.classList.add("d-none");
        }

        // Ocultar elementos admin
        this.hideAdminElements();

        // Ocultar logout
        if (this.elements.logoutButton) {
            this.elements.logoutButton.classList.add("d-none");
        }

        console.log("Usuario no autenticado");
    }

    /**
     * Muestra elementos administrativos según el rol del usuario
     * @param {string} userRole - Rol del usuario actual
     * @description Controla la visibilidad de funciones según permisos de rol
     * @business Implementa el control granular de acceso a funcionalidades
     */
    showAdminElements(userRole) {
        this.elements.adminItems.forEach((element) => {
            const requiredRoles = element.dataset.requiredRoles?.split(",") || [
                "root",
            ];

            if (
                requiredRoles.includes(userRole) ||
                requiredRoles.includes("all")
            ) {
                element.classList.remove("d-none");
            } else {
                element.classList.add("d-none");
            }
        });
    }

    /**
     * Oculta todos los elementos administrativos
     * @description Asegura que funciones administrativas no sean visibles sin permisos
     */
    hideAdminElements() {
        this.elements.adminItems.forEach((element) => {
            element.classList.add("d-none");
        });
    }

    /**
     * Controla el estado de carga del botón de login
     * @param {boolean} isLoading - true para mostrar loading, false para estado normal
     * @description Proporciona feedback visual durante el proceso de autenticación
     */
    setLoginLoading(isLoading) {
        if (this.elements.loginButton) {
            if (isLoading) {
                this.elements.loginButton.disabled = true;
                this.elements.loginButton.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Iniciando sesión...
                `;
            } else {
                this.elements.loginButton.disabled = false;
                this.elements.loginButton.innerHTML = "Iniciar Sesión";
            }
        }
    }

    // MANEJO DE MENSAJES

    /**
     * Muestra un mensaje de error al usuario
     * @param {string} message - Mensaje de error a mostrar
     * @description Presenta errores tanto en UI local como en toast global
     */
    showError(message) {
        // Feedback visual en el login (opcional)
        if (this.elements.loginError) {
            this.elements.loginError.textContent = message;
            this.elements.loginError.classList.remove("d-none");
        }
        // Siempre mostrar toast global
        mostrarToast(message, "error");
    }

    /**
     * Muestra un mensaje de éxito al usuario
     * @param {string} message - Mensaje de éxito a mostrar
     * @description Proporciona feedback positivo mediante toast
     */
    showSuccess(message) {
        mostrarToast(message, "success");
    }

    /**
     * Limpia los mensajes de error de la interfaz
     * @description Oculta elementos de error en el formulario de login
     */
    clearError() {
        if (this.elements.loginError) {
            this.elements.loginError.classList.add("d-none");
        }
    }

    /**
     * Convierte mensajes de error técnicos en mensajes amigables
     * @param {string} errorMessage - Mensaje de error original de la API
     * @returns {string} Mensaje de error amigable para el usuario
     * @description Mejora la experiencia de usuario con mensajes comprensibles
     */
    getErrorMessage(errorMessage) {
        const errorMap = {
            "Email y password son requeridos":
                "Por favor, completa todos los campos",
            "Usuario no encontrado": "Email o contraseña incorrectos",
            "Contraseña incorrecta": "Email o contraseña incorrectos",
            "Formato de email inválido": "Por favor, ingresa un email válido",
            "Token no válido o expirado":
                "Tu sesión ha expirado, inicia sesión nuevamente",
        };

        return (
            errorMap[errorMessage] ||
            "Error al iniciar sesión. Intenta nuevamente."
        );
    }

    // MÉTODOS DE UTILIDAD PÚBLICOS

    /**
     * Verifica si hay un usuario autenticado actualmente
     * @returns {boolean} true si está autenticado, false si no
     * @description Método público para verificar estado de autenticación
     */
    isAuthenticated() {
        return !!this.currentUser && !!localStorage.getItem("token");
    }

    /**
     * Obtiene los datos del usuario actual
     * @returns {Object|null} Datos del usuario o null si no está autenticado
     * @description Proporciona acceso a los datos del usuario autenticado
     */
    getCurrentUser() {
        if (!this.currentUser) {
            const userData = localStorage.getItem("user");
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        }
        return this.currentUser;
    }

    /**
     * Verifica si el usuario tiene un rol específico
     * @param {string} role - Rol a verificar (root, analista, repositor)
     * @returns {boolean} true si tiene el rol, false si no
     * @description Utilidad para verificación granular de permisos
     */
    hasRole(role) {
        return this.currentUser?.rol === role;
    }

    /**
     * Requiere que el usuario esté autenticado para continuar
     * @returns {boolean} true si está autenticado, false y redirige si no
     * @description Guard function para proteger rutas que requieren autenticación
     * @security Punto de control crítico para acceso a funcionalidades protegidas
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            location.assign("/frontend/html/admin/login.html");
            return false;
        }
        return true;
    }

    /**
     * Requiere que el usuario tenga un rol específico para continuar
     * @param {string} requiredRole - Rol requerido para el acceso
     * @returns {boolean} true si tiene el rol, false y bloquea si no
     * @description Guard function para proteger funcionalidades específicas por rol
     * @security Control de acceso granular por funcionalidad
     */
    requireRole(requiredRole) {
        if (!this.requireAuth()) return false;

        if (!this.hasRole(requiredRole)) {
            alert("No tienes permisos para acceder a esta sección");
            window.history.back();
            return false;
        }
        return true;
    }
}

/**
 * Inicialización global del controlador de autenticación
 * @description Crea la instancia principal del controlador cuando el DOM está listo
 *              y la expone globalmente como window.Auth para uso en toda la aplicación
 */
document.addEventListener("DOMContentLoaded", () => {
    window.Auth = new AuthController();
});
