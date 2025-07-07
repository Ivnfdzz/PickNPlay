class ApiClient {
    constructor() {
        // URL base del backend
        this.baseURL = "http://localhost:3000/api";

        // Headers por defecto
        this.defaultHeaders = {
            "Content-Type": "application/json",
        };
    }

    // Método base para hacer peticiones HTTP
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

    // MÉTODOS DE AUTENTICACIÓN
    async login(email, password) {
        return await this._request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    }

    async getProfile() {
        return await this._request("/auth/profile");
    }

    // MÉTODOS DE USUARIOS
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

    // MÉTODOS DE ROLES

    async getRoles() {
        return await this._request("/roles");
    }

    async getRol(id) {
        return await this._request(`/roles/${id}`);
    }

    // MÉTODOS DE CATEGORÍAS

    async getCategorias() {
        return await this._request("/categorias");
    }

    async getCategoria(id) {
        return await this._request(`/categorias/${id}`);
    }

    // MÉTODOS DE SUBCATEGORÍAS

    async getSubcategorias() {
        return await this._request("/subcategorias");
    }

    async getSubcategoria(id) {
        return await this._request(`/subcategorias/${id}`);
    }

    async getSubcategoriasPorCategoria(categoriaId) {
        return await this._request(`/subcategorias/categoria/${categoriaId}`);
    }

    async crearSubcategoria(subcategoria) {
        return this._request("/subcategorias", {
            method: "POST",
            body: JSON.stringify(subcategoria),
        });
    }

    async actualizarSubcategoria(id, subcatData) {
        return this._request(`/subcategorias/${id}`, {
            method: "PUT",
            body: JSON.stringify(subcatData),
        });
    }

    async eliminarSubcategoria(id) {
        return this._request(`/subcategorias/${id}`, {
            method: "DELETE",
        });
    }

    // MÉTODOS DE PRODUCTOS

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

    async buscarProducto(termino) {
        return await this._request(
            `/productos/buscar?q=${encodeURIComponent(termino)}`
        );
    }

    async getProducto(id) {
        return await this._request(`/productos/${id}`);
    }

    // MÉTODOS DE PEDIDOS

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

    async eliminarPedido(id) {
        return await this._request(`/pedidos/${id}`, {
            method: "DELETE",
        });
    }

    // MÉTODOS DE PAGOS

    async getMetodosPago() {
        return await this._request("/metodosPago");
    }

    async getMetodoPago(id) {
        return await this._request(`/metodosPago/${id}`);
    }

    async actualizarMetodoPago(id, metodoData) {
        return await this._request(`/metodosPago/${id}`, {
            method: "PUT",
            body: JSON.stringify(metodoData),
        });
    }

    async getMetodosPagoActivos() {
        return await this._request("/metodosPago/activos");
    }

    async crearMetodoPago(metodoPago) {
        return await this._request("/metodosPago", {
            method: "POST",
            body: JSON.stringify(metodoPago),
        });
    }

    async eliminarMetodoPago(id) {
        return await this._request(`/metodosPago/${id}`, {
            method: "DELETE",
        });
    }

    // MÉTODOS ADMINISTRATIVOS

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

    // MÉTODOS DE AUDITORÍA

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

// EXPORTACIÓN CORREGIDA
const apiInstance = new ApiClient();

// Hacer disponible globalmente
window.ApiClient = apiInstance;
