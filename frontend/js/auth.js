class AuthController {
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

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

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

    handleLogout() {
        this.clearSession();
        mostrarToast("Sesión cerrada correctamente", "info");
        setTimeout(() => {
            location.assign("/frontend/html/login.html");
        }, 1500);
    }

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
                    location.assign("/frontend/html/login.html");
                }
            }
        } else {
            this.updateUIForUnauthenticatedUser();

            // Si está en página admin sin auth, redirigir
            if (window.location.pathname.includes("/admin/")) {
                location.assign("/frontend/html/login.html");
            }
        }
    }

    // GESTIÓN DE SESIÓN

    saveSession(token, user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    }

    clearSession() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.currentUser = null;
    }

    // VERIFICACIONES DE PERMISOS

    verifyAdminAccess() {
        const userRole = this.currentUser?.rol;

        if (!["root", "analista", "repositor"].includes(userRole)) {
            alert("No tienes permisos para acceder al panel administrativo");
            location.assign("/frontend/html/index.html");
            return false;
        }

        return true;
    }

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

    hideAdminElements() {
        this.elements.adminItems.forEach((element) => {
            element.classList.add("d-none");
        });
    }

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

    showError(message) {
        // Feedback visual en el login (opcional)
        if (this.elements.loginError) {
            this.elements.loginError.textContent = message;
            this.elements.loginError.classList.remove("d-none");
        }
        // Siempre mostrar toast global
        mostrarToast(message, "error");
    }

    showSuccess(message) {
        mostrarToast(message, "success");
    }

    clearError() {
        if (this.elements.loginError) {
            this.elements.loginError.classList.add("d-none");
        }
    }

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
    isAuthenticated() {
        return !!this.currentUser && !!localStorage.getItem("token");
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const userData = localStorage.getItem("user");
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        }
        return this.currentUser;
    }

    hasRole(role) {
        return this.currentUser?.rol === role;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            location.assign("/frontend/html/login.html");
            return false;
        }
        return true;
    }

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

document.addEventListener("DOMContentLoaded", () => {
    window.Auth = new AuthController();
});
