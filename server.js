// 1. Importar as bibliotecas necessárias
const express = require('express');
const path = require('path');

// 2. Inicializar o servidor Express
const app = express();
const PORT = 3000; // A porta onde nosso servidor vai rodar


app.use(express.json());


app.use(express.static(path.join(__dirname, '')));


app.post('/api/login', (req, res) => {
    // Pega o email e a senha que o front enviou no body
    const { email, senha } = req.body;

    console.log('Recebida tentativa de login com:', email);

    
    if (email === 'rafael@exemplo.com' && senha === '123') {
        // SUCESSO!
        // Responde com um JSON indicando sucesso
        console.log('Login bem-sucedido!');
        res.json({ success: true, message: 'Login bem-sucedido!' });
    } else {
        // FALHA!
        // Responde com um JSON indicando falha
        console.log('Falha no login: credenciais inválidas.');
        res.json({ success: false, message: 'Email ou senha inválidos.' });
    }
});

// 6. Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Acesse http://localhost:3000/login.html para começar.');
});