(function () {
    const THEME_KEY = "pickplay_theme";
    const html = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Detectar todos los toggles posibles
    function getToggleButtons() {
        return Array.from(document.querySelectorAll(".btn-dark-mode, #btn-modo-oscuro"));
    }

    // Cambia el modo y actualiza UI
    function setTheme(theme) {
        html.setAttribute("data-bs-theme", theme);
        localStorage.setItem(THEME_KEY, theme);
        updateToggleButtons(theme);
    }

    // Alterna entre claro y oscuro
    function toggleTheme() {
        const current = html.getAttribute("data-bs-theme") || "light";
        setTheme(current === "dark" ? "light" : "dark");
    }

    // Actualiza texto/icono de los toggles
    function updateToggleButtons(theme) {
        getToggleButtons().forEach(btn => {
            if (btn.tagName === "BUTTON") {
                if (btn.querySelector("i.bi")) {
                    btn.querySelector("i.bi").className = theme === "dark" ? "bi bi-sun" : "bi bi-moon";
                }
                if (btn.textContent.match(/Modo oscuro|Modo claro/)) {
                    btn.textContent = theme === "dark" ? "Modo claro" : "Modo oscuro";
                }
            }
        });
    }

    // Inicializa el modo según localStorage o preferencia SO
    function initTheme() {
        let theme = localStorage.getItem(THEME_KEY);
        if (!theme) theme = prefersDark ? "dark" : "light";
        setTheme(theme);
    }

    // Eventos
    document.addEventListener("DOMContentLoaded", function () {
        initTheme();
        getToggleButtons().forEach(btn => {
            btn.addEventListener("click", toggleTheme);
        });
    });

    // Exponer para uso manual si se requiere
    window.PickPlayTheme = {
        setTheme,
        toggleTheme,
        getTheme: () => html.getAttribute("data-bs-theme")
    };
})();