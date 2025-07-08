/**
 * PICK&PLAY - SISTEMA DE GESTIÓN DE TEMA CLARO/OSCURO
 * 
 * @description Módulo responsable de la gestión completa del modo oscuro en toda la aplicación.
 *              Proporciona funcionalidades para alternar entre tema claro y oscuro, persistencia
 *              de preferencias del usuario y detección automática de preferencias del sistema.
 * 
 * @features    - Detección automática de preferencia del sistema operativo
 *              - Persistencia de selección en localStorage
 *              - Soporte para múltiples botones de alternancia
 *              - Actualización automática de iconos y textos de botones
 *              - Integración completa con Bootstrap data-bs-theme
 *              - Inicialización automática al cargar la página
 *              - API pública para control manual del tema
 * 
 * @integration Compatible con Bootstrap 5.x y utiliza el atributo data-bs-theme
 *              para el cambio dinámico de temas sin recarga de página.
 * 
 * @business    El modo oscuro mejora la experiencia del usuario, especialmente
 *              en ambientes de poca luz, reduce la fatiga visual y proporciona
 *              una interfaz moderna y accesible.
 * 
 * @version     1.0.0
 * @since       2024
 * @authors     Iván Fernández y Luciano Fattoni
 */

(function () {
    const THEME_KEY = "pickplay_theme";
    const html = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    /**
     * Detecta y retorna todos los botones de alternancia de tema disponibles
     * @function getToggleButtons
     * @returns {Array<Element>} Array de elementos botón para alternancia de tema
     * @description Busca en el DOM todos los botones con clases específicas para
     *              alternar el tema, permitiendo múltiples controles en la misma página.
     */
    function getToggleButtons() {
        return Array.from(document.querySelectorAll(".btn-dark-mode, #btn-modo-oscuro"));
    }

    /**
     * Establece el tema específico y actualiza toda la interfaz
     * @function setTheme
     * @param {string} theme - Tema a aplicar: "light" o "dark"
     * @description Aplica el tema especificado al documento, lo persiste en localStorage
     *              y actualiza todos los botones de alternancia disponibles.
     */
    function setTheme(theme) {
        html.setAttribute("data-bs-theme", theme);
        localStorage.setItem(THEME_KEY, theme);
        updateToggleButtons(theme);
    }

    /**
     * Alterna entre tema claro y oscuro
     * @function toggleTheme
     * @description Cambia automáticamente entre "light" y "dark" basándose en el tema actual.
     *              Función principal para la interacción del usuario con los controles de tema.
     */
    function toggleTheme() {
        const current = html.getAttribute("data-bs-theme") || "light";
        setTheme(current === "dark" ? "light" : "dark");
    }

    /**
     * Actualiza el texto e iconos de todos los botones de alternancia
     * @function updateToggleButtons
     * @param {string} theme - Tema actual para determinar el estado de los botones
     * @description Sincroniza todos los botones de alternancia con el tema actual,
     *              actualizando iconos Bootstrap y textos descriptivos apropiadamente.
     */
    function updateToggleButtons(theme) {
        getToggleButtons().forEach(btn => {
            if (btn.tagName === "BUTTON") {
                // Actualizar iconos Bootstrap
                if (btn.querySelector("i.bi")) {
                    btn.querySelector("i.bi").className = theme === "dark" ? "bi bi-sun" : "bi bi-moon";
                }
                // Actualizar texto descriptivo
                if (btn.textContent.match(/Modo oscuro|Modo claro/)) {
                    btn.textContent = theme === "dark" ? "Modo claro" : "Modo oscuro";
                }
            }
        });
    }

    /**
     * Inicializa el tema basándose en preferencias guardadas o del sistema
     * @function initTheme
     * @description Establece el tema inicial consultando localStorage primero,
     *              y si no existe preferencia, utiliza la preferencia del sistema operativo.
     */
    function initTheme() {
        let theme = localStorage.getItem(THEME_KEY);
        if (!theme) theme = prefersDark ? "dark" : "light";
        setTheme(theme);
    }

    // Inicialización automática y configuración de eventos
    document.addEventListener("DOMContentLoaded", function () {
        initTheme();
        getToggleButtons().forEach(btn => {
            btn.addEventListener("click", toggleTheme);
        });
    });

    // API pública para control manual del tema
    window.PickPlayTheme = {
        setTheme,
        toggleTheme,
        getTheme: () => html.getAttribute("data-bs-theme")
    };
})();