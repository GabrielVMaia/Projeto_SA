<?php
// --[[ Headers ]]--
// Define que o conteúdo retornado será JSON para o cliente interpretar corretamente
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

// Usuário e senha definidos para autenticação simples (hardcoded)
$adminUser = 'admin';
$adminPass = 'admin123';

// Verifica se o usuário e senha conferem
if ($usuario === $adminUser && $senha === $adminPass) {
    // Define um cookie chamado 'login_user' válido por 1 hora, acessível em toda a aplicação
    setcookie('login_user', $usuario, time() + 3600, "/");
    // Retorna sucesso em JSON
    echo json_encode(['success' => true, 'message' => 'Login efetuado com sucesso!']);
} else {
    // Retorna erro em JSON caso usuário ou senha estejam incorretos
    echo json_encode(['success' => false, 'message' => 'Usuário ou senha inválidos']);
}

exit;
?>
