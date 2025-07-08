/**
 * PICK&PLAY - CLIENTE API CENTRALIZADO
 * 
 * @description Módulo responsable de la comunicación centralizada con la API backend.
 *              Proporciona una interfaz unificada para todas las operaciones CRUD del sistema,
 *              manejo de autenticación, gestión de errores y soporte para diferentes tipos
 *              de contenido (JSON y FormData).
 * 
 * @features    - Cliente HTTP unificado con configuración centralizada
 *              - Gestión automática de tokens de autenticación
 *              - Soporte para JSON y FormData (subida de archivos)
 *              - Métodos CRUD completos para todas las entidades
 *              - Manejo robusto de errores HTTP
 *              - Endpoints organizados por funcionalidad
 *              - Filtros y búsquedas parametrizadas
 *              - Estadísticas y reportes especializados
 * 
 * @entities    - Autenticación y perfiles de usuario
 *              - Usuarios, roles y permisos
 *              - Categorías y subcategorías
 *              - Productos con imágenes y relaciones
 *              - Pedidos y detalles de venta
 *              - Métodos de pago y configuración
 *              - Auditoría y logs del sistema
 * 
 * @business    El cliente API centraliza toda la comunicación con el backend,
 *              asegurando consistencia en el manejo de datos, autenticación
 *              y proporcionando una base sólida para todas las operaciones.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

class ApiClient {
    /**
     * Constructor del cliente API
     * @description Inicializa la configuración base del cliente incluyendo URL del backend
     *              y headers por defecto para todas las peticiones HTTP.
     */
    constructor() {
        this.baseURL = "http://localhost:3000/api";
        this.defaultHeaders = {
            "Content-Type": "application/json",
        };
    }

    /**
     * Método base para realizar peticiones HTTP al backend
     * 
     * @private
     * @async
     * @method _request
     * @param {string} endpoint - Endpoint relativo de la API (ej: "/usuarios")
     * @param {Object} [options={}] - Opciones adicionales para fetch (method, body, etc.)
     * @param {boolean} [isFormData=false] - Indica si se envía FormData (para archivos)
     * @returns {Promise<Object|null>} Respuesta parseada como JSON o null para 204
     * @throws {Error} Error de comunicación HTTP o del servidor
     * @description Método centralizado que maneja autenticación automática, headers dinámicos,
     *              gestión de errores HTTP y parsing de respuestas según el tipo de contenido.
     */
    async _request(endpoint, options = {}, isFormData = false) {
        const url = `${this.baseURL}${endpoint}`;

        let headers = { ...this.defaultHeaders };

        // Inyección automática de token de autenticación
        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Configuración especial para FormData (subida de archivos)
        if (isFormData) {
            delete headers["Content-Type"];
        }

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
            // Manejo de respuestas vacías (HTTP 204)
            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // ================================
    // MÉTODOS DE AUTENTICACIÓN
    // ================================

    /**
     * Autentica un usuario en el sistema
     * @async
     * @method login
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<Object>} Objeto con token y datos del usuario
     * @business Punto de entrada principal para acceso al sistema administrativo
     */
    async login(email, password) {
        return await this._request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    }

    /**
     * Obtiene el perfil del usuario autenticado
     * @async
     * @method getProfile
     * @returns {Promise<Object>} Datos del perfil del usuario actual
     */
    async getProfile() {
        return await this._request("/auth/profile");
    }

    // ================================
    // MÉTODOS DE USUARIOS
    // ================================

    /**
     * Obtiene la lista completa de usuarios del sistema
     * @async
     * @method getUsuarios
     * @returns {Promise<Array>} Array de usuarios con información de roles
     * @business Solo accesible para usuarios con rol 'root'
     */
    async getUsuarios() {
        return await this._request("/usuarios");
    }

    /**
     * Obtiene un usuario específico por ID
     * @async
     * @method getUsuario
     * @param {number} id - ID del usuario a obtener
     * @returns {Promise<Object>} Datos completos del usuario
     */
    async getUsuario(id) {
        return await this._request(`/usuarios/${id}`);
    }

    /**
     * Crea un nuevo usuario en el sistema
     * @async
     * @method crearUsuario
     * @param {Object} usuarioData - Datos del usuario {username, email, password, id_rol}
     * @returns {Promise<Object>} Usuario creado con ID asignado
     */
    async crearUsuario(usuarioData) {
        return await this._request("/usuarios", {
            method: "POST",
            body: JSON.stringify(usuarioData),
        });
    }

    /**
     * Actualiza un usuario existente
     * @async
     * @method actualizarUsuario
     * @param {number} id - ID del usuario a actualizar
     * @param {Object} usuarioData - Datos a actualizar (password es opcional)
     * @returns {Promise<Object>} Usuario actualizado
     */
    async actualizarUsuario(id, usuarioData) {
        return await this._request(`/usuarios/${id}`, {
            method: "PUT",
            body: JSON.stringify(usuarioData),
        });
    }

    /**
     * Elimina un usuario del sistema
     * @async
     * @method eliminarUsuario
     * @param {number} id - ID del usuario a eliminar
     * @returns {Promise<null>} Confirmación de eliminación
     */
    async eliminarUsuario(id) {
        return await this._request(`/usuarios/${id}`, {
            method: "DELETE",
        });
    }

    // ================================
    // MÉTODOS DE ROLES
    // ================================

    /**
     * Obtiene todos los roles disponibles en el sistema
     * @async
     * @method getRoles
     * @returns {Promise<Array>} Array de roles con sus permisos
     */
    async getRoles() {
        return await this._request("/roles");
    }

    /**
     * Obtiene un rol específico por ID
     * @async
     * @method getRol
     * @param {number} id - ID del rol a obtener
     * @returns {Promise<Object>} Datos del rol específico
     */
    async getRol(id) {
        return await this._request(`/roles/${id}`);
    }

    // ================================
    // MÉTODOS DE CATEGORÍAS
    // ================================

    /**
     * Obtiene todas las categorías del sistema
     * @async
     * @method getCategorias
     * @returns {Promise<Array>} Array de categorías principales
     */
    async getCategorias() {
        return await this._request("/categorias");
    }

    /**
     * Obtiene una categoría específica por ID
     * @async
     * @method getCategoria
     * @param {number} id - ID de la categoría
     * @returns {Promise<Object>} Datos de la categoría
     */
    async getCategoria(id) {
        return await this._request(`/categorias/${id}`);
    }

    // ================================
    // MÉTODOS DE SUBCATEGORÍAS
    // ================================

    /**
     * Obtiene todas las subcategorías del sistema
     * @async
     * @method getSubcategorias
     * @returns {Promise<Array>} Array de subcategorías con relación a categorías padre
     */
    async getSubcategorias() {
        return await this._request("/subcategorias");
    }

    /**
     * Obtiene una subcategoría específica por ID
     * @async
     * @method getSubcategoria
     * @param {number} id - ID de la subcategoría
     * @returns {Promise<Object>} Datos de la subcategoría
     */
    async getSubcategoria(id) {
        return await this._request(`/subcategorias/${id}`);
    }

    /**
     * Obtiene subcategorías filtradas por categoría padre
     * @async
     * @method getSubcategoriasPorCategoria
     * @param {number} categoriaId - ID de la categoría padre
     * @returns {Promise<Array>} Subcategorías de la categoría especificada
     */
    async getSubcategoriasPorCategoria(categoriaId) {
        return await this._request(`/subcategorias/categoria/${categoriaId}`);
    }

    /**
     * Crea una nueva subcategoría
     * @async
     * @method crearSubcategoria
     * @param {Object} subcategoria - Datos de la subcategoría {nombre, id_categoria}
     * @returns {Promise<Object>} Subcategoría creada
     */
    async crearSubcategoria(subcategoria) {
        return this._request("/subcategorias", {
            method: "POST",
            body: JSON.stringify(subcategoria),
        });
    }

    /**
     * Actualiza una subcategoría existente
     * @async
     * @method actualizarSubcategoria
     * @param {number} id - ID de la subcategoría a actualizar
     * @param {Object} subcatData - Datos a actualizar
     * @returns {Promise<Object>} Subcategoría actualizada
     */
    async actualizarSubcategoria(id, subcatData) {
        return this._request(`/subcategorias/${id}`, {
            method: "PUT",
            body: JSON.stringify(subcatData),
        });
    }

    /**
     * Elimina una subcategoría del sistema
     * @async
     * @method eliminarSubcategoria
     * @param {number} id - ID de la subcategoría a eliminar
     * @returns {Promise<null>} Confirmación de eliminación
     */
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

// Instancia singleton del cliente API
const apiInstance = new ApiClient();

// Exportación global para uso en toda la aplicación
window.ApiClient = apiInstance;
