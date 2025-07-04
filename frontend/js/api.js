class ApiClient {
    constructor() {
        // URL base de tu backend (desde index.js)
        this.baseURL = "http://localhost:3000/api";

        // Headers por defecto
        this.defaultHeaders = {
            "Content-Type": "application/json",
        };
    }

    // ========== MÉTODOS BASE ==========

    /**
     * Método base para hacer peticiones HTTP
     */
    async _request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Configurar headers
        const headers = { ...this.defaultHeaders };

        // Agregar token si existe (para rutas protegidas)
        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Configuración final de la petición
        const config = {
            headers,
            ...options,
        };

        try {
            const response = await fetch(url, config);

            // Verificar si la respuesta es exitosa
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message || `HTTP Error: ${response.status}`
                );
            }

            return data;
        } catch (error) {
            console.error(`API Error en ${endpoint}:`, error.message);
            throw error;
        }
    }

    // ========== MÉTODOS DE AUTENTICACIÓN ==========
    // Conecta con /api/auth/login (tu AuthController)

    async login(email, password) {
        return await this._request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    }

    async getProfile() {
        return await this._request("/auth/profile");
    }

    // ========== MÉTODOS DE USUARIOS ==========
    // Conecta con /api/usuarios (tu UsuarioController)
    // Solo para administradores con rol root

    async getUsuarios() {
        return await this._request("/usuarios");
    }

    async getUsuario(id) {
        return await this._request(`/usuarios/${id}`);
    }

    async crearUsuario(usuarioData) {
        return await this._request("/usuarios", {
            method: "POST",
            body: JSON.stringify(usuarioData),
        });
    }

    async actualizarUsuario(id, usuarioData) {
        return await this._request(`/usuarios/${id}`, {
            method: "PUT",
            body: JSON.stringify(usuarioData),
        });
    }

    async eliminarUsuario(id) {
        return await this._request(`/usuarios/${id}`, {
            method: "DELETE",
        });
    }

    async getEstadisticasUsuarios() {
        return await this._request("/usuarios/estadisticas");
    }

    // ========== MÉTODOS DE ROLES ==========
    // Para los forms de creación/edición de usuarios

    async getRoles() {
        return await this._request("/roles");
    }

    async getRol(id) {
        return await this._request(`/roles/${id}`);
    }

    // ========== MÉTODOS DE CATEGORÍAS ==========
    // Conecta con /api/categorias (tu CategoriaController)

    async getCategorias() {
        return await this._request("/categorias");
    }

    async getCategoria(id) {
        return await this._request(`/categorias/${id}`);
    }

    // ========== MÉTODOS DE SUBCATEGORÍAS ==========
    // Conecta con /api/subcategorias (tu SubcategoriaController)

    async getSubcategorias() {
        return await this._request("/subcategorias");
    }

    async getSubcategoria(id) {
        return await this._request(`/subcategorias/${id}`);
    }

    // ✅ MÉTODO FALTANTE
    async getSubcategoriasPorCategoria(categoriaId) {
        return await this._request(`/subcategorias/categoria/${categoriaId}`);
    }

    // ========== MÉTODOS DE PRODUCTOS ==========
    // Conecta con /api/productos (tu ProductoController)

    async getProductos() {
        return await this._request("/productos");
    }

    async getProductosActivos() {
        return await this._request("/productos/activos");
    }

    async getProductosPorCategoria(categoriaId) {
        return await this._request(`/productos/categoria/${categoriaId}`);
    }

    async getProductosPorSubcategoria(subcategoriaId) {
        return await this._request(`/productos/subcategoria/${subcategoriaId}`);
    }

    async buscarProductos(termino) {
        return await this._request(
            `/productos/buscar?q=${encodeURIComponent(termino)}`
        );
    }

    async getProducto(id) {
        return await this._request(`/productos/${id}`);
    }

    // ========== MÉTODOS DE PEDIDOS ==========
    // Conecta con /api/pedidos (tu PedidoController)

    async crearPedido(pedidoData) {
        return await this._request("/pedidos", {
            method: "POST",
            body: JSON.stringify(pedidoData),
        });
    }

    async getPedidos() {
        return await this._request("/pedidos");
    }

    async getPedido(id) {
        return await this._request(`/pedidos/${id}`);
    }

    // ========== MÉTODOS DE PAGOS ==========
    // Conecta con /api/metodos-pago (tu MetodoPagoController)

    async getMetodosPago() {
        return await this._request("/metodos-pago");
    }

    async getMetodosPagoActivos() {
        return await this._request("/metodos-pago/activos");
    }

    // ========== MÉTODOS ADMINISTRATIVOS ==========
    // Para el futuro panel de admin

    async crearProducto(productoData) {
        return await this._request("/productos", {
            method: "POST",
            body: JSON.stringify(productoData),
        });
    }

    async actualizarProducto(id, productoData) {
        return await this._request(`/productos/${id}`, {
            method: "PUT",
            body: JSON.stringify(productoData),
        });
    }

    async eliminarProducto(id) {
        return await this._request(`/productos/${id}`, {
            method: "DELETE",
        });
    }

    // ========== MÉTODOS DE AUDITORÍA ==========
    // Conecta con /api/logs (tu AuditoriaController)

    async getLogs(filtros = {}) {
        const params = new URLSearchParams();

        Object.keys(filtros).forEach((key) => {
            if (filtros[key]) {
                params.append(key, filtros[key]);
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/logs?${queryString}` : "/logs";

        return await this._request(endpoint);
    }

    async getEstadisticasAuditoria() {
        return await this._request("/logs/estadisticas");
    }
}

// ========== EXPORTACIÓN CORREGIDA ==========
// Usar un nombre diferente para evitar conflictos
const apiInstance = new ApiClient();

// Hacer disponible globalmente
window.ApiClient = apiInstance;

// Verificar que se exportó correctamente
console.log('🌐 ApiClient cargado correctamente');
console.log('🔧 Tipo de ApiClient:', typeof window.ApiClient);
console.log('🔧 Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.ApiClient)));
