<?php
// --[[ Headers ]]--
// Headers são usados para passar informação adicional ao cliente
// Refereência: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers
// Dizemos que nosso tipo de conteudo é json
header('Content-Type: application/json');

// Verifica se o método HTTP é POST, se não, retorna erro 405 (Método não permitido)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Lê o conteúdo JSON enviado no corpo da requisição
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Verifica se os dados necessários foram enviados (usuario e senha)
if (!isset($input['usuario']) || !isset($input['senha'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

// Remove espaços extras do nome do usuário e obtém a senha
$usuario = trim($input['usuario']);
$senha = $input['senha'];

// Caminho para o arquivo de logins
$loginFile = __DIR__ . '/db/logins.json';

// Verifica se o arquivo existe
if (!file_exists($loginFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Arquivo de configuração não encontrado']);
    exit;
}

// Lê e decodifica o arquivo JSON
$loginsJSON = file_get_contents($loginFile);
$logins = json_decode($loginsJSON, true);

// Verifica se houve erro na decodificação do JSON
if ($logins === null) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao ler arquivo de configuração']);
    exit;
}

// Procura pelo usuário no array de logins
$loginValido = false;
foreach ($logins as $login) {
    if ($login['usuario'] === $usuario && $login['senha'] === $senha) {
        $loginValido = true;
        break;
    }
}

// Verifica se o usuário e senha conferem
if ($loginValido) {
    // Define um cookie chamado 'login_user' válido por 1 hora, acessível em todo o site
    setcookie('login_user', $usuario, time() + 3600, "/");
    // Retorna sucesso em JSON
    echo json_encode(['success' => true, 'message' => 'Login efetuado com sucesso!']);
} else {
    // Retorna erro em JSON caso usuário ou senha estejam incorretos
    echo json_encode(['success' => false, 'message' => 'Usuário ou senha inválidos']);
}
exit;
?>