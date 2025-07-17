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