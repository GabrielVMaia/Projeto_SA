// --[[ Elementos da página ]]--

const loginBtn = document.getElementById('login-btn');
const usuarioInput = document.querySelector('input[placeholder="Usuário"]');
const senhaInput = document.querySelector('input[placeholder="Senha"]');

// --[[ Função para mostrar popup de mensagem ]]--

function mostrarPopup(message, type = 'error', duration = 3000) {
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


// --[[ Enviar dados para o PHP via fetch ]]--
async function enviarLogin(usuario, senha) {
    try {
        const response = await fetch('script.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ usuario, senha })
        });
        const data = await response.json();

        if (data.success) {
            mostrarPopup(data.message || 'Login efetuado com sucesso!', 'success', 2200);
            setTimeout(() => {
                window.location.href = '../admin/index.html';
            }, 2000);
        } else {
            mostrarPopup(data.message || 'Usuário ou senha inválidos.');
        }
    } catch (error) {
        mostrarPopup('Erro na conexão com o servidor.');
        console.error('Erro:', error);
    }
}

// --[[ Evento do botão de login ]]--

loginBtn.addEventListener('click', () => {
    const usuario = usuarioInput.value.trim();
    const senha = senhaInput.value;

    if (!usuario || !senha) {
        mostrarPopup('Preencha usuário e senha.');
        return;
    }

    enviarLogin(usuario, senha);
});
