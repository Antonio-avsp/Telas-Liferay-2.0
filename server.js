// 1. Importar as bibliotecas necessárias
const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client'); // <--- 1. Importar o Prisma

// 2. Inicializar o servidor Express e o Prisma
const app = express();
const prisma = new PrismaClient(); // <--- 2. Instanciar o Prisma
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// Rota de Login (Lógica ATUALIZADA com Prisma)
// Usamos 'async' pois o Prisma é baseado em Promises
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;
    console.log('Recebida tentativa de login com:', email);

    try {
        // 3. Buscar o usuário no banco de dados
        // O Prisma mapeia 'USUÁRIO' para 'usuario' (ou similar)
        // Verifique seu schema.prisma se tiver dúvidas no nome
        const usuario = await prisma.usuario.findFirst({
            where: {
                email: email, // Busca pelo email
            },
        });

        // 4. Verificar se o usuário existe e se a senha está correta
        if (usuario && usuario.senha === senha) {
            console.log('Login bem-sucedido!');
            // O app.js (frontend) espera 'success: true'
            res.json({ success: true, message: 'Login bem-sucedido!' });
        } else {
            console.log('Falha no login: credenciais inválidas.');
            res.json({ success: false, message: 'Email ou senha inválidos.' });
        }

    } catch (error) {
        // 5. Tratar qualquer erro de banco de dados
        console.error('Erro ao tentar fazer login:', error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

// 6. Iniciar o servidor
// Rota para Criar uma Nova Oportunidade (POST /api/oportunidades)
app.post('/api/oportunidades', async (req, res) => {
    const dados = req.body;
    
    // --- IMPORTANTE: Aqui, estamos assumindo IDs existentes no banco de dados. ---
    // Faria uma consulta (SELECT) para obter o ID da ONG e o ID do TIPO.
    const USUARIO_CPF_CRIADOR = 123456789; // Assumindo que o usuário logado tem este CPF (o nosso usuário de teste)
    const INSTITUIÇÃO_ID = 1;              // Assumindo que a ONG tem ID 1
    const TIPO_VOLUNTARIADO_ID = 1;        // Assumindo que 'Educação' ou 'Meio Ambiente' tem ID 1

    try {
        const novaOportunidade = await prisma.Oportunidade.create({
            data: {
                titulo: dados.titulo,
                descricao: dados.descricao,
                // Mapeamento dos IDs de chave estrangeira
                USUARIO_CPF_CRIADOR: USUARIO_CPF_CRIADOR,
                INSTITUIÇÃO_idINSTITUIÇÃO: INSTITUIÇÃO_ID,
                TIPO_VOLUNTARIADO_idTIPO_VOLUNTARIADO: TIPO_VOLUNTARIADO_ID, 
                
                // Outros campos
                data_evento: new Date(dados.data), // Converte a string de data para objeto Date
                horario: dados.horario,
                duracao_horas: dados.duracao,
                local_evento: `${dados.formato} - ${dados.cidade}, ${dados.pais}`, // Combina Local/Formato
                num_vagas: dados.numVoluntarios,
                habilidades_desejadas: dados.habilidades,
                imagem_url: dados.imagem, 
            },
        });

        // Sucesso na criação
        res.json({ success: true, oportunidadeId: novaOportunidade.idOPORTUNIDADE });

    } catch (error) {
        console.error('Erro ao criar oportunidade no Prisma:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao salvar os dados.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Acesse http://localhost:3000/login.html para começar.');
});