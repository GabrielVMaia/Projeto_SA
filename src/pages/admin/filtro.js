const filtrosContainer = document.querySelector('.filtros-container');
const inputsFiltro = filtrosContainer.querySelectorAll('input[data-campo]');
const scrollableArea = document.querySelector('.scrollable-area');

function aplicarFiltros() {
    const filtros = {};

    inputsFiltro.forEach(input => {
        const campo = input.dataset.campo;
        const valor = input.value.trim().toLowerCase();
        if (valor) filtros[campo] = valor;
    });

    // Carrega todos os registros do localStorage para garantir sincronização
    registroManager.carregarTodos();

    // Filtra os registros pela author (Nome) e dados conforme filtros
    const registrosFiltrados = registroManager.registros.filter(registro => {
        for (let campo in filtros) {
            let valorFiltro = filtros[campo];
            let valorRegistro = '';

            if (campo === "Nome") {
                valorRegistro = (registro.author || '').toLowerCase();
            } else {
                valorRegistro = (registro.dados[campo] || '').toString().toLowerCase();
            }

            if (!valorRegistro.includes(valorFiltro)) return false;
        }
        return true;
    });

    scrollableArea.innerHTML = '';

    if (registrosFiltrados.length === 0) {
        const vazioMsg = document.createElement('div');
        vazioMsg.textContent = 'Nenhum registro encontrado com esses filtros.';
        vazioMsg.style.color = 'var(--white)';
        vazioMsg.style.textAlign = 'center';
        vazioMsg.style.marginTop = '20px';
        scrollableArea.appendChild(vazioMsg);
        return;
    }

    registrosFiltrados.forEach(registro => {
        const elemento = criarElementoRegistro(registro);
        scrollableArea.appendChild(elemento);
    });

    adicionarEventListeners();
}

inputsFiltro.forEach(input => {
    input.addEventListener('input', aplicarFiltros);
});

// Inicializa exibindo tudo
document.addEventListener('DOMContentLoaded', aplicarFiltros);
