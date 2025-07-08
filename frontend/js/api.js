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
    async _request(endpoint, options = {}, isFormData = false) {
        const url = `${this.baseURL}${endpoint}`;

        // Configurar headers
        let headers = { ...this.defaultHeaders };

        // Agregar token si existe (para rutas protegidas)
        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Si es FormData, eliminar Content-Type para que el navegador lo setee automáticamente
        if (isFormData) {
            delete headers["Content-Type"];
        }

        // Configuración final de la petición
        const config = {
            headers,
            ...options,
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || response.statusText);
            }
            // Si la respuesta es vacía (204), no intentar parsear JSON
            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
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

    async crearProducto(productoData, isFormData = false) {
        let options;
        if (isFormData) {
            options = {
                method: "POST",
                body: productoData,
            };
        } else {
            options = {
                method: "POST",
                body: JSON.stringify(productoData),
            };
        }
        return await this._request("/productos", options, isFormData);
    }

    async actualizarProducto(id, productoData, isFormData = false) {
        let options;
        if (isFormData) {
            options = {
                method: "PUT",
                body: productoData,
            };
        } else {
            options = {
                method: "PUT",
                body: JSON.stringify(productoData),
            };
        }
        return await this._request(`/productos/${id}`, options, isFormData);
    }

    async eliminarProducto(id) {
        return await this._request(`/productos/${id}`, {
            method: "DELETE",
        });
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

    // MÉTODOS DE AUDITORÍA

    async getLogs(filtros = {}) {
        // Construir query string a partir de filtros
        const params = new URLSearchParams();
        if (filtros.usuario) params.append("usuario", filtros.usuario);
        if (filtros.accion) params.append("accion", filtros.accion);
        if (filtros.producto) params.append("producto", filtros.producto);
        if (filtros.desde) params.append("desde", filtros.desde);
        if (filtros.limite) params.append("limite", filtros.limite);

        return await this._request(`/auditoria?${params.toString()}`);
    }

    // MÉTODOS DE ESTADÍSTICAS

    async getEstadisticasAuditoria() {
        return await this._request("/auditoria/estadisticas");
    }

    async getEstadisticasUsuarios() {
        return await this._request("/usuarios/estadisticas");
    }

    async getProductos() {
        return await this._request("/productos");
    }

    async getPedidos() {
        return await this._request("/pedidos");
    }
}

// EXPORTACIÓN CORREGIDA
const apiInstance = new ApiClient();

// Hacer disponible globalmente
window.ApiClient = apiInstance;
