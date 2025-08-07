/*
    PARA WILLIAM

    TODO:
        Interações básicas dos botões (Apenas o de modificar informações, com o icone de lapis)
        Interação pra fechar o pop-up do icone do lapis

    O elemento dentro do html é: (do pop-up)
     <button id="write" class="write"><i class="fa-solid fa-pencil"></i></button>
*/

const EscrevaBotoes = document.querySelectorAll('.write');
const modal = document.getElementById('modal');
const fecharModal = document.getElementById('close-modal')
EscrevaBotoes.forEach(button => {
    button.addEventListener("click", function() {
        console.log("oi")
    })
})

/* --[[ Definição de um registro ]] */

// Estrutura de um registro
/*
    Registro
    {
        Created at: DD/MM/YY XX:XX
        Created by: Author

        Dados {
            Nome: "Comentário da silva",E
            Email: "Comentario.Silca@gmail.com",
            Idade: 12,
            CPF: "112.221.222-20",
            CEP: "1227-3200"
            ...
        }
    }

*/

class Registro {
    constructor(Author, Dados = {}, date)
    {
        // TODO formatação de data
        this.Author = Author
        this.date = date 
        this.dados = Dados
    }

    exibirDados() 
    {
        console.log("Criado por: ", this.Author)
        console.log("Criado quando: ", this.date)

        console.log("Dados: ");

        for(let chave in this.dados) {
            console.log(`${chave} : ${this.dados[chave]}`);
        }
    }

    adicionarDado(chave, dado)
    {
        this.Dados[chave] = dado;
    }

    removerDado(chave)
    {
        this.Dados[chave] = "Removido";
    }

    apagarChave(chave)
    {
        delete this.dados[chave];
    }

    
}

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
