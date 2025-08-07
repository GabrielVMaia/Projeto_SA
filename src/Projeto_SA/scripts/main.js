/* --[[ Interação básica ]] */

const btns = document.getElementsByClassName("write-btn");
const modal = document.querySelector(".info-modal");
const closebtn = document.getElementById("close-modal")

for (let btn of btns) {
    btn.addEventListener('click', function() {
        modal.classList.add("info-modal-show");
    });
}

closebtn.addEventListener('click', function() {
    modal.classList.remove("info-modal-show")
})

/* --[[ Formatação de inputs ]]-- */

const templateCPF = "XXX.XXX.XXX-XX"
const templateCEP = "XXXXX-XXX"

function formatar(input, template)
{
    let numeros = input.replace(/[^0-9]/g, '');
    let res = "";
    let index = 0;

    for (let i = 0; i < template.length && index < numeros.length; i++)
    {
        if (template[i] == 'X')
        {
            res += numeros[index];
            index++
            // console.log(res)
        } else {
            res += template[i]
            // console.log(res)
        }
    }
    // console.log(res)
    return res;
}

const inputCpf = document.getElementById("input-cpf")
const inputCEP = document.getElementById("input-cep")

inputCpf.addEventListener("input", function(e)
{
    e.target.value = formatar(e.target.value, templateCPF)
})

inputCEP.addEventListener("input", function(e)
{
    e.target.value = formatar(e.target.value, templateCEP)
})

/* --[[ AJAX ]]-- */

function handleForm(event) {
    event.preventDefault();

    const form = document.querySelector('.form-change');
    const formData = new FormData(form);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'scripts/handle.php', true);
    
    const handleResponse = () => {
        const isSuccess = xhr.status === 200;
        const errorMsg = isSuccess ? null : `Erro ${xhr.status}: Verifique os dados ou conexão`;
        
        if (!isSuccess) return alert(errorMsg);
        
        try {
            const response = JSON.parse(xhr.responseText);
            const message = response.success ? 'Dados salvos com sucesso!' : `Erro: ${response.message}`;
            
            alert(message);
            
            if (response.success) {
                modal.classList.remove("info-modal-show");
                form.reset();
            }
        } catch (e) {
            console.error('Parse error:', e);
            alert('Erro na resposta do servidor');
        }
    };

    xhr.onreadystatechange = () => xhr.readyState === 4 && handleResponse();
    xhr.onerror = () => alert('Erro de conexão. Verifique se o servidor está rodando.');
    xhr.send(formData);
}

/* --[[ Sistema de Registros ]] */

// Estrutura de um registro
/*
    Registro
    {
        Created at: DD/MM/YY HH:MM
        Created by: Author
        
        Dados {
            Nome: "Comentário da Silva",
            Email: "comentario.silva@gmail.com",
            Idade: 12,
            CPF: "112.221.222-20",
            CEP: "12273-200"
            ...
        }
    }
*/

// Classe de registro, sua "definição" e métodos (funções)

class Registro {
    constructor(author, dados = {}, date = null) {
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
            const nomeArquivo = `Registro_${this.author}_${Date.now()}`;
        
            const registroCompleto = {
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
                    registroData.date
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
/*

  <div class="Bar-Element">
    João Pedro Oliveira 
    <button class="info-btn" data-id="3"><i class="fa-solid fa-info"></i></button> 
    <button class="write-btn" data-id="3"><i class="fa-solid fa-pencil"></i></button>   
    <button class="trash-btn" data-id="3"><i class="fa-solid fa-trash"></i></button> 
  </div>

*/


/* --[[ Funções de Debug ]]-- */

const parentClass = document.querySelector(".scrollable-area")

function debug_add_elements(Elementos, Nome) {
    for (let i = 0; i < Elementos; i++) {
        let div = document.createElement('div')
        div.className = "Bar-Element"
        div.innerHTML = `
            ${Nome} da Silva ${i + 1}
            <button class="info-btn"><i class="fa-solid fa-info"></i></button>
            <button class="write-btn" class="write"><i class="fa-solid fa-pencil"></i></button>
            <button class="trash-btn"><i class="fa-solid fa-trash"></i></button>
        `
        parentClass.appendChild(div)
    }    
}

function debug_criar_registro(Author, Dados={})
{   
    reg = new Registro(Author, Dados, Date.now())
    reg.exibirDados()
}
