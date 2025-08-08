/* --[[ Interação básica ]] */

const modalCreate = document.getElementById("modal-create");
const modalEdit = document.getElementById("modal-edit");
const modalInfo = document.getElementById("modal-info");

const closeBtnCreate = document.getElementById("close-create-modal");
const closeBtnEdit = document.getElementById("close-edit-modal");
const closeBtnInfo = document.getElementById("close-info-modal");

const emptyBtn = document.getElementById("empty");

emptyBtn.addEventListener('click', function() {
    modalCreate.classList.add("info-modal-show");
});

closeBtnCreate.addEventListener('click', function() {
    modalCreate.classList.remove("info-modal-show");
});

closeBtnEdit.addEventListener('click', function() {
    modalEdit.classList.remove("info-modal-show");
});

closeBtnInfo.addEventListener('click', function() {
    modalInfo.classList.remove("info-modal-show");
});

/* --[[ Formatação de inputs ]]-- */

const templateCPF = "XXX.XXX.XXX-XX";
const templateCEP = "XXXXX-XXX";

function formatar(input, template) {
    let numeros = input.replace(/[^0-9]/g, '');
    let res = "";
    let index = 0;

    for (let i = 0; i < template.length && index < numeros.length; i++) {
        if (template[i] == 'X') {
            res += numeros[index];
            index++;
        } else {
            res += template[i];
        }
    }
    return res;
}

const inputCpfCreate = document.getElementById("input-cpf-create");
const inputCepCreate = document.getElementById("input-cep-create");
const inputCpfEdit = document.getElementById("edit-cpf");
const inputCepEdit = document.getElementById("edit-cep");

inputCpfCreate.addEventListener("input", function(e) {
    e.target.value = formatar(e.target.value, templateCPF);
});

inputCepCreate.addEventListener("input", function(e) {
    e.target.value = formatar(e.target.value, templateCEP);
});

inputCpfEdit.addEventListener("input", function(e) {
    e.target.value = formatar(e.target.value, templateCPF);
});

inputCepEdit.addEventListener("input", function(e) {
    e.target.value = formatar(e.target.value, templateCEP);
});


/* --[[ Popup ]]-- */

function mostratPopup(message, type = 'success', duration = 3000) {
  const popup = document.getElementById('popup-message');
  const icon = document.getElementById('popup-icon');
  const text = document.getElementById('popup-text');
  const closeBtn = document.getElementById('popup-close');

  popup.className = ''; // reseta classes
  popup.classList.add(type);
  popup.classList.remove('hidden');

  icon.className = ''; // reseta classes
  icon.classList.add('fa-solid');
  icon.classList.add(type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark');

  text.textContent = message;

  function esconder() {
    popup.classList.add('hidden');
    clearTimeout(timeoutId);
  }

  closeBtn.onclick = esconder;

  const timeoutId = setTimeout(esconder, duration);
}

document.getElementById('popup-close').addEventListener('click', () => {
    document.getElementById('popup-message').classList.add('hidden');
});

/* --[[ AJAX ]]-- */

function enviarParaPHP(formData, funcResposta) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'handle.php', true);
   
    const handleResposta = () => {
        try {
            // Tenta parsear a resposta JSON primeiro, mesmo com status de erro
            const resposta = JSON.parse(xhr.responseText);
            
            // Verifica se tem redirecionamento (cookie expirado/sem login)
            if (resposta.redirect) {
                mostratPopup(resposta.message || "Sessão expirada. Redirecionando...", "error");
                setTimeout(() => {
                    window.location.href = resposta.redirect;
                }, 2000);
                return;
            }
            
            // Exibe mensagem do PHP (sucesso ou erro)
            if (resposta.success) {
                mostratPopup(resposta.message || "Operação concluída com sucesso!", "success");
            } else {
                mostratPopup(resposta.message || "Ocorreu um erro.", "error");
            }
            
            funcResposta(resposta);
            
        } catch (e) {
            // Se não conseguir fazer parse do JSON, trata como erro de servidor
            if (xhr.status === 0) {
                mostratPopup('Erro de conexão. Verifique se o servidor está rodando.', "error");
            } else if (xhr.status >= 500) {
                mostratPopup(`Erro interno do servidor (${xhr.status}). Tente novamente.`, "error");
            } else if (xhr.status === 401) {
                mostratPopup('Acesso negado. Faça login novamente.', "error");
                setTimeout(() => {
                    window.location.href = '../login/login.html';
                }, 2000);
            } else if (xhr.status === 405) {
                mostratPopup('Método não permitido. Erro na aplicação.', "error");
            } else {
                mostratPopup(`Erro ${xhr.status}: ${xhr.responseText || 'Resposta inválida do servidor'}`, "error");
            }
            
            console.error('Parse error:', e);
            console.error('Response text:', xhr.responseText);
            console.error('Status:', xhr.status);
        }
    };
    
    xhr.onreadystatechange = () => xhr.readyState === 4 && handleResposta();
    xhr.onerror = () => mostratPopup('Erro de conexão. Verifique se o servidor está rodando.', "error");
    xhr.send(formData);
}

/* --[[ Função para pegar cookie pelo nome ]] */

function pegarCookie(name) {
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
        let [key, value] = c.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}

/* --[[ Formulário de Criação ]]-- */

const formCreate = document.getElementById("form-create");
formCreate.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const errorDiv = document.getElementById('create-error');
    if(errorDiv){
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
    }

    const formData = new FormData(formCreate);
    const author = pegarCookie('login_user') || 'Desconhecido';
    formData.append('author', author);
    
    enviarParaPHP(formData, function(response) {
        
        if (!response.success) {
            if(errorDiv){
              errorDiv.textContent = response.message;
              errorDiv.style.display = 'block';
            }
            return;
        }

        if (response.data) {
            const novoRegistro = registroManager.criarRegistro(
                author,
                {
                    "Nome": response.data.nome,
                    "Email": response.data.email,
                    "Idade": response.data.idade,
                    "CPF": response.data.cpf,
                    "CEP": response.data.cep,
                    "Cargo": response.data.cargo
                }
            );
            novoRegistro.salvarStorage();
            
            modalCreate.classList.remove("info-modal-show");
            formCreate.reset();
            carregarRegistrosNaTela();

        }
    });
});

/* --[[ Formulário de Edição ]]-- */

const formEdit = document.getElementById("form-edit");

formEdit.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(formEdit);
    
    enviarParaPHP(formData, function(response) {
        const message = response.success ? response.message : `Erro: ${response.message}`;
        
        if (response.success && response.data) {
            const id = parseFloat(response.data.id);
            const registro = registroManager.buscarPorId(id);
            
            if (registro) {
                registro.author = response.data.nome;
                registro.dados = {
                    "Nome": response.data.nome,
                    "Email": response.data.email,
                    "Idade": response.data.idade,
                    "CPF": response.data.cpf,
                    "CEP": response.data.cep,
                    "Cargo": response.data.cargo
                };
                
                registro.salvarStorage();
                modalEdit.classList.remove("info-modal-show");
                carregarRegistrosNaTela();
            }
        }
    });
});

/* --[[ Sistema de Registros ]] */

class Registro {
    constructor(author, dados = {}, date = null, id = null) {
        this.id = id || Date.now() + Math.random();
        this.author = author;
        this.date = date || this.formatarData(new Date());
        this.dados = dados;
    }

    formatarData(data) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = String(data.getFullYear()).slice(-2);
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        
        return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    }

    exibirDados() {
        console.log("=== REGISTRO ===");
        console.log("Criado por:", this.author);
        console.log("Criado em:", this.date);
        console.log("\nDados:");
        
        if (Object.keys(this.dados).length === 0) {
            console.log("  (Nenhum dado cadastrado)");
        } else {
            for (let chave in this.dados) {
                console.log(`  ${chave}: ${this.dados[chave]}`);
            }
        }
        console.log("================");
    }

    adicionarDado(chave, dado) {
        this.dados[chave] = dado;
        console.log(`Dado adicionado: ${chave} = ${dado}`);
    }

    removerDado(chave) {
        if (this.dados.hasOwnProperty(chave)) {
            this.dados[chave] = "Removido";
            console.log(`Dado removido: ${chave}`);
        } else {
            console.log(`Chave '${chave}' não encontrada`);
        }
    }

    apagarChave(chave) {
        if (this.dados.hasOwnProperty(chave)) {
            delete this.dados[chave];
            console.log(`Chave '${chave}' apagada completamente`);
        } else {
            console.log(`Chave '${chave}' não encontrada`);
        }
    }

    salvarStorage() {
        try {
            const nomeArquivo = `Registro_${this.author}_${this.id}`;
        
            const registroCompleto = {
                id: this.id,
                author: this.author,
                date: this.date,
                dados: this.dados
            };
            
            localStorage.setItem(nomeArquivo, JSON.stringify(registroCompleto));
            console.log(`Registro salvo como: ${nomeArquivo}`);
            
            return nomeArquivo;
        } catch (error) {
            console.error("Erro ao salvar no localStorage:", error);
            return null;
        }
    }

    static carregarStorage(nomeArquivo) {
        try {
            const dados = localStorage.getItem(nomeArquivo);
            if (dados) {
                const registroData = JSON.parse(dados);
                return new Registro(
                    registroData.author,
                    registroData.dados,
                    registroData.date,
                    registroData.id
                );
            }
            console.log(`Registro '${nomeArquivo}' não encontrado`);
            return null;
        } catch (error) {
            console.error("Erro ao carregar do localStorage:", error);
            return null;
        }
    }

    static listarRegistrosSalvos() {
        const registros = [];
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            if (chave && chave.startsWith('Registro_')) {
                registros.push(chave);
            }
        }
        return registros;
    }

    static removerDoStorage(id) {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const chave = localStorage.key(i);
                if (chave && chave.startsWith('Registro_')) {
                    const dados = JSON.parse(localStorage.getItem(chave));
                    if (dados.id === id) {
                        localStorage.removeItem(chave);
                        console.log(`Registro ${chave} removido do localStorage`);
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            console.error("Erro ao remover do localStorage:", error);
            return false;
        }
    }
}

class RegistroManager {
    constructor() {
        this.registros = [];
    }

    criarRegistro(author, dados = {}) {
        const novoRegistro = new Registro(author, dados);
        this.registros.push(novoRegistro);
        console.log(`Novo registro criado para: ${author}`);
        return novoRegistro;
    }

    listarRegistros() {
        console.log("\n=== TODOS OS REGISTROS ===");
        if (this.registros.length === 0) {
            console.log("Nenhum registro encontrado");
        } else {
            this.registros.forEach((registro, index) => {
                console.log(`\n--- Registro ${index + 1} ---`);
                registro.exibirDados();
            });
        }
    }

    buscarPorAutor(author) {
        return this.registros.filter(registro => 
            registro.author.toLowerCase().includes(author.toLowerCase())
        );
    }

    buscarPorId(id) {
        return this.registros.find(registro => registro.id === id);
    }

    removerRegistro(id) {
        const index = this.registros.findIndex(registro => registro.id === id);
        if (index !== -1) {
            this.registros.splice(index, 1);
            Registro.removerDoStorage(id);
            console.log(`Registro com ID ${id} removido`);
            return true;
        }
        return false;
    }

    salvarTodos() {
        const nomesSalvos = [];
        this.registros.forEach(registro => {
            const nome = registro.salvarStorage();
            if (nome) nomesSalvos.push(nome);
        });
        console.log(`${nomesSalvos.length} registros salvos no localStorage`);
        return nomesSalvos;
    }

    carregarTodos() {
        const registrosSalvos = Registro.listarRegistrosSalvos();
        this.registros = [];
        
        registrosSalvos.forEach(nomeArquivo => {
            const registro = Registro.carregarStorage(nomeArquivo);
            if (registro) {
                this.registros.push(registro);
            }
        });
        
        console.log(`${this.registros.length} registros carregados do localStorage`);
        return this.registros;
    }
}

/* --[[ Carregamento dos dados ]]-- */

const registroManager = new RegistroManager();
const parentClass = document.querySelector(".scrollable-area");

function criarElementoRegistro(registro) {
    const div = document.createElement('div');
    div.className = 'Bar-Element';
    div.innerHTML = `
        ${registro.dados.Nome || 'Sem Nome'}
        <button class="info-btn" data-id="${registro.id}"><i class="fa-solid fa-info"></i></button>
        <button class="write-btn" data-id="${registro.id}"><i class="fa-solid fa-pencil"></i></button>
        <button class="trash-btn" data-id="${registro.id}"><i class="fa-solid fa-trash"></i></button>
    `;
    return div;
}

function carregarRegistrosNaTela() {
    const elementosExistentes = parentClass.querySelectorAll('.Bar-Element');
    elementosExistentes.forEach(el => el.remove());

    registroManager.carregarTodos();

    registroManager.registros.forEach(registro => {
        const elemento = criarElementoRegistro(registro);
        parentClass.appendChild(elemento);
    });

    adicionarEventListeners();
}

function adicionarEventListeners() {
    const infoBtns = document.querySelectorAll('.info-btn');
    infoBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseFloat(this.getAttribute('data-id'));
            const registro = registroManager.buscarPorId(id);
            if (registro) {
                mostrarInfoModal(registro);
            }
        });
    });

    const trashBtns = document.querySelectorAll('.trash-btn');
    trashBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseFloat(this.getAttribute('data-id'));
            if (confirm('Tem certeza que deseja excluir este registro?')) {
                if (registroManager.removerRegistro(id)) {
                    carregarRegistrosNaTela();
                    mostratPopup('Registro removido com sucesso!');
                }
            }
        });
    });


    const writeBtns = document.querySelectorAll('.write-btn');
    writeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseFloat(this.getAttribute('data-id'));
            const registro = registroManager.buscarPorId(id);
            if (registro) {
                preencherFormularioEdicao(registro);
                modalEdit.classList.add("info-modal-show");
            }
        });
    });
}

function preencherFormularioEdicao(registro) {
    document.getElementById('edit-id').value = registro.id;
    document.getElementById('edit-nome').value = registro.dados.Nome || '';
    document.getElementById('edit-email').value = registro.dados.Email || '';
    document.getElementById('edit-idade').value = registro.dados.Idade || '';
    document.getElementById('edit-cpf').value = registro.dados.CPF || '';
    document.getElementById('edit-cep').value = registro.dados.CEP || '';
    document.getElementById('edit-cargo').value = registro.dados.Cargo || '';
}

function mostrarInfoModal(registro) {
    const detailsDiv = document.getElementById('info-details');
    let dadosHtml = `
        <h2>Informações do Registro</h2>
        <p><strong>Nome:</strong> ${registro.author}</p>
        <p><strong>Criado em:</strong> ${registro.date}</p>
        <h3>Dados:</h3>
    `;

    if (Object.keys(registro.dados).length === 0) {
        dadosHtml += '<p><em>Nenhum dado adicional cadastrado</em></p>';
    } else {
        for (let chave in registro.dados) {
            dadosHtml += `<p><strong>${chave}:</strong> ${registro.dados[chave]}</p>`;
        }
    }

    detailsDiv.innerHTML = dadosHtml;
    modalInfo.classList.add('info-modal-show');
}

document.addEventListener('DOMContentLoaded', function() {
    carregarRegistrosNaTela();
});

/* --[[ Funções de Debug ]]-- */

function debug_add_elements(Elementos, Nome) {
    for (let i = 0; i < Elementos; i++) {
        let div = document.createElement('div');
        div.className = "Bar-Element";
        div.innerHTML = `
            ${Nome} da Silva ${i + 1}
            <button class="info-btn"><i class="fa-solid fa-info"></i></button>
            <button class="write-btn" class="write"><i class="fa-solid fa-pencil"></i></button>
            <button class="trash-btn"><i class="fa-solid fa-trash"></i></button>
        `;
        parentClass.appendChild(div);
    }    
}

function debug_criar_registro(Author, Dados={}) {   
    reg = new Registro(Author, Dados, Date.now());
    reg.exibirDados();
}

function debug_criar_varios_registros(quantidade = 5) {
    const nomes = [
        "João Silva",
        "Maria Santos", 
        "Pedro Oliveira",
        "Ana Costa",
        "Carlos Ferreira"
    ];

    const emails = [
        "joao.silva@gmail.com",
        "maria.santos@gmail.com",
        "pedro.oliveira@gmail.com",
        "ana.costa@gmail.com",
        "carlos.ferreira@gmail.com"
    ];

    const cargos = [
        "Desenvolvedor",
        "Analista",
        "Gerente",
        "Designer",
        "Suporte Técnico"
    ];

    console.log(`Criando ${quantidade} registros de debug...`);

    for (let i = 0; i < quantidade; i++) {
        const nomeIndex = i % nomes.length;
        const dadosCompletos = {
            "Nome": nomes[nomeIndex],
            "Email": emails[nomeIndex],
            "CPF": "170.286.620-39",
            "CEP": "64007-230",
            "Idade": Math.floor(Math.random() * 50) + 18,
            "Cargo": cargos[nomeIndex]
        };

        const novoRegistro = registroManager.criarRegistro(nomes[nomeIndex], dadosCompletos);
        novoRegistro.salvarStorage();
    }

    carregarRegistrosNaTela();
    console.log(`${quantidade} registros criados e salvos com sucesso!`);
}

function debug_limpar_todos_registros() {
    if (confirm("Tem certeza que deseja limpar TODOS os registros? Esta ação não pode ser desfeita.")) {
        const registrosSalvos = Registro.listarRegistrosSalvos();
        registrosSalvos.forEach(nomeArquivo => {
            localStorage.removeItem(nomeArquivo);
        });

        registroManager.registros = [];
        carregarRegistrosNaTela();
        
        console.log("Todos os registros foram removidos!");
        alert("Todos os registros foram removidos!");
    }
}
