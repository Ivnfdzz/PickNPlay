// Teclado Virtual Modular para autoservicio
// Uso: TecladoVirtual.init(inputElement)

const TecladoVirtual = {
    layout: [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L','Ñ'],
        ['Z','X','C','V','B','N','M','←'],
        ['MAY','space']
    ],
    mayusculas: false,
    input: null,
    container: null,

    init(inputElement) {
        this.input = inputElement;
        this.crearTeclado();
        this.input.setAttribute('readonly', 'readonly');
    },

    crearTeclado() {
        // Eliminar si ya existe
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
                if(tecla === 'space') {
                    btn.textContent = 'space';
                    btn.style.minWidth = '7rem';
                } else if(tecla === 'MAY') {
                    btn.textContent = 'MAY';
                } else {
                    btn.textContent = this.mayusculas && /^[a-zA-Z]$/.test(tecla) ? tecla.toUpperCase() : tecla;
                }
                if(['←','MAY','space'].includes(tecla)) btn.classList.add('tecla-accion');
                btn.addEventListener('click', () => this.manejarTecla(tecla));
                filaDiv.appendChild(btn);
            });
            this.container.appendChild(filaDiv);
        });
        this.input.parentNode.appendChild(this.container);
    },

    manejarTecla(tecla) {
        if (tecla === '←') {
            this.input.value = this.input.value.slice(0, -1);
        } else if (tecla === 'MAY') {
            this.mayusculas = !this.mayusculas;
            this.crearTeclado();
        } else if (tecla === 'space') {
            this.input.value += ' ';
        } else {
            this.input.value += this.mayusculas ? tecla.toUpperCase() : tecla.toLowerCase();
        }
        this.input.dispatchEvent(new Event('input'));
    }
};

window.TecladoVirtual = TecladoVirtual;
