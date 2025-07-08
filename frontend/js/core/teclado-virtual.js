/**
 * PICK&PLAY - SISTEMA DE TECLADO VIRTUAL PARA AUTOSERVICIO
 * 
 * @description Módulo responsable de proporcionar un teclado virtual interactivo
 *              para terminales de autoservicio y dispositivos táctiles. Diseñado
 *              específicamente para entornos donde no hay teclado físico disponible
 *              o para mejorar la experiencia táctil del usuario.
 * 
 * @features    - Layout QWERTY completo con teclas especiales
 *              - Soporte para mayúsculas y minúsculas
 *              - Tecla de espacio extendida para facilitar uso táctil
 *              - Tecla de retroceso para corrección de errores
 *              - Integración automática con inputs de texto
 *              - Generación dinámica de HTML y eventos
 *              - Estilo responsive adaptado para pantallas táctiles
 *              - Protección automática de inputs (readonly)
 * 
 * @usage       TecladoVirtual.init(inputElement) - Inicializa teclado para input específico
 * 
 * @business    El teclado virtual es esencial para terminales de autoservicio,
 *              permitiendo a clientes ingresar información sin necesidad de
 *              teclado físico, mejorando la accesibilidad y experiencia de uso.
 * 
 * @version     1.0.0
 * @since       2024
 * @authors     Iván Fernández y Luciano Fattoni
 */

const TecladoVirtual = {
    /**
     * Layout del teclado QWERTY con teclas especiales
     * @property {Array<Array<string>>} layout - Distribución de teclas por filas
     * @description Define la disposición de teclas en formato QWERTY estándar
     *              con teclas especiales para funcionalidad completa.
     */
    layout: [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L','Ñ'],
        ['Z','X','C','V','B','N','M','←'],
        ['MAY','space']
    ],

    /**
     * Estado actual del modo mayúsculas
     * @property {boolean} mayusculas - Indica si el teclado está en modo mayúsculas
     */
    mayusculas: false,

    /**
     * Referencia al input actualmente asociado
     * @property {HTMLElement|null} input - Elemento input vinculado al teclado
     */
    input: null,

    /**
     * Contenedor del teclado virtual en el DOM
     * @property {HTMLElement|null} container - Elemento contenedor del teclado
     */
    container: null,

    /**
     * Inicializa el teclado virtual para un input específico
     * @method init
     * @param {HTMLElement} inputElement - Elemento input al que asociar el teclado
     * @description Configura el teclado virtual, lo vincula al input especificado
     *              y establece el input como readonly para prevenir entrada física.
     * @business Punto de entrada principal para habilitar entrada táctil en terminales
     */
    init(inputElement) {
        this.input = inputElement;
        this.crearTeclado();
        this.input.setAttribute('readonly', 'readonly');
    },

    /**
     * Genera dinámicamente el HTML del teclado virtual
     * @method crearTeclado
     * @description Construye el DOM del teclado basándose en el layout definido,
     *              aplicando estilos apropiados y configurando event listeners.
     *              Remueve instancias previas para evitar duplicados.
     */
    crearTeclado() {
        // Limpieza de instancias previas
        const existente = document.getElementById('teclado-virtual');
        if (existente) existente.remove();

        this.container = document.createElement('div');
        this.container.id = 'teclado-virtual';
        this.container.className = 'teclado-virtual';

        this.layout.forEach((fila, idx) => {
            const filaDiv = document.createElement('div');
            filaDiv.className = 'teclado-virtual-fila';
            
            fila.forEach(tecla => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'teclado-virtual-boton';
                
                // Configuración específica por tipo de tecla
                if(tecla === 'space') {
                    btn.textContent = 'ESPACIO';
                    btn.style.minWidth = '7rem';
                } else if(tecla === 'MAY') {
                    btn.textContent = 'MAY';
                } else {
                    btn.textContent = this.mayusculas && /^[a-zA-Z]$/.test(tecla) ? tecla.toUpperCase() : tecla;
                }
                
                // Estilo especial para teclas de acción
                if(['←','MAY','space'].includes(tecla)) btn.classList.add('tecla-accion');
                
                btn.addEventListener('click', () => this.manejarTecla(tecla));
                filaDiv.appendChild(btn);
            });
            this.container.appendChild(filaDiv);
        });
        
        this.input.parentNode.appendChild(this.container);
    },

    /**
     * Procesa las pulsaciones de teclas virtuales
     * @method manejarTecla
     * @param {string} tecla - Tecla presionada en el teclado virtual
     * @description Gestiona la lógica de entrada para cada tipo de tecla,
     *              incluyendo retroceso, mayúsculas, espacio y caracteres normales.
     *              Dispara eventos de input para mantener compatibilidad.
     */
    manejarTecla(tecla) {
        if (tecla === '←') {
            // Retroceso: eliminar último carácter
            this.input.value = this.input.value.slice(0, -1);
        } else if (tecla === 'MAY') {
            // Alternar modo mayúsculas y regenerar teclado
            this.mayusculas = !this.mayusculas;
            this.crearTeclado();
        } else if (tecla === 'space') {
            // Insertar espacio
            this.input.value += ' ';
        } else {
            // Insertar carácter normal con caso apropiado
            this.input.value += this.mayusculas ? tecla.toUpperCase() : tecla.toLowerCase();
        }
        
        // Disparar evento input para compatibilidad con validaciones
        this.input.dispatchEvent(new Event('input'));
    }
};

// Exportación global para uso en toda la aplicación
window.TecladoVirtual = TecladoVirtual;
