<?php
// --[[ Headers ]]--
// Headers são usados para passar informação adicional ao cliente
// Refereência: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers

// Dizemos que nosso tipo de conteudo é json
header('Content-Type: application/json');

// Essas headers são de tipo "CORS"
// CORS ((Cross-Origin Resource Sharing))
// Controla o acesso a recursos de um domínio diferente daquele onde a página web está sendo executada.
// Ref: https://developer.mozilla.org/en-US/docs/Glossary/CORS

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Remove certos erros de acontecer em produção
error_reporting(0);

function error()
{
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Dados inválidos'
    ]);

    exit;
}

// Função utilizada para validar o CPF
// Ref: https://www.sefaz.pe.gov.br/Servicos/sintegra/Paginas/calculo-do-digito-verificador.aspx
function validaCPF($cpf) 
{
    $cpf = preg_replace( '/[^0-9]/is', '', $cpf );
     
    if (strlen($cpf) != 11)
    {
        return false;
    }

    if (preg_match('/(\d)\1{10}/', $cpf))
     {
        return false;
    }

    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) 
        {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) 
        {
            return false;
        }
    }
    return true;

}

// Função utilizada para validar o CEP
function validarCEP($cep) 
{
    $cep = preg_replace("/[^0-9]/", "", $cep);
  
    if (strlen($cep) != 8) {
      return false; 
    }
  
    if (!preg_match('/^[0-9]{5}[0-9]{3}$/', $cep))
    {
       return false; 
    }
    return true;
}

// Caso o método seja post, ele faz o handling aqui
if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{
    // Vemos se todos os campos foram preenchidos
    $required_fields = ['nome', 'idade', 'email', 'cpf', 'cep'];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field])) {
            error("Campo obrigatório '$field' não encontrado");
        }
    }
    
    // Pegamos os parametros do post e filtramos eles
    // Ref de filters: https://www.php.net/manual/en/book.filter.php
    $nome = filter_var($_POST["nome"] ?? '', FILTER_UNSAFE_RAW);
    $idade = filter_var($_POST["idade"] ?? '', FILTER_VALIDATE_INT);
    $email = filter_var($_POST["email"] ?? '', FILTER_VALIDATE_EMAIL);
    $cpf = preg_replace('/[^0-9]/', '', $_POST["cpf"] ?? '');
    $cep = preg_replace('/[^0-9]/', '', $_POST["cep"] ?? '');

    // Aqui, fazemos if inline para apenas dar erro caso algo de errado
    // Permitindo o resto do flow ser declarado de forma simple sem ser uma piramede
    if (empty($nome)) { error(); } // Validação do nome
    if ($idade == FALSE || $idade <= 0) { error(); }   // Validação da idade
    if (!strpos($email, "@gmail.com")) { error(); } // Validação do email

    if (!validaCPF($cpf)) { error(); } // Validação do CPF
    if (!validarCEP($cep)) { error(); } // Validação do CEP

    // Flow do código caso não dê erro (no caso, passe as validações)
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Dados salvos!"
    ]);

} else { // Não permitimos outros métodos no site, apenas POST, então caso não for POST, retornamos 405
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']); // Proibe outros métodos no site
}
?>
