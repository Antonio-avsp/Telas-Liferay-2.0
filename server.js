// ==================================================================
// SERVIDOR BACK-END (Node.js + Express + Prisma)
// ==================================================================

const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer'); // Biblioteca para lidar com upload de arquivos. 


const app = express();
const prisma = new PrismaClient(); // Cliente para conectar ao Banco de Dados
const PORT = 3000;

// --- CONFIGURAÇÃO DE UPLOAD (MULTER) ---
// Define onde salvar as imagens das oportunidades e como nomeá-las
// Ex: quando o usuario mandar a imagem no formulario a imagem vai ficar salva na pasta uploads atraves desssa bliblioteca 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Pasta de destino
    },
    filename: function (req, file, cb) {
        // Adiciona o timestamp (Date.now) para evitar arquivos com nomes duplicados
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// --- MIDDLEWARES (Configurações globais do servidor) ---
app.use(express.json()); // Permite que o servidor entenda JSON no corpo das requisições
app.use(express.static(path.join(__dirname, ''))); // Serve os arquivos HTML/CSS/JS da raiz
app.use('/uploads', express.static('uploads')); // Torna a pasta de imagens acessível publicamente

// ==================================================================
// 1. AUTENTICAÇÃO
// ==================================================================

// ROTA: LOGIN DE USUÁRIO
// Verifica se o email e senha batem com o registro no banco.
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;
    console.log('Tentativa de Login:', email);

    try {
        // Busca o usuário pelo email
        const usuario = await prisma.usuario.findFirst({
            where: { email: email },
        });

        // Validação simples de senha (em produção, se utilizaria criptografia/hash)
        if (usuario && usuario.senha === senha) {
            console.log('Login OK:', usuario.nomeUsuario);
            // Retorna sucesso e os dados essenciais para o Front-end salvar no LocalStorage
            res.json({ 
                success: true, 
                message: 'Login bem-sucedido!', 
                user: { cpf: usuario.cpf, nome: usuario.nomeUsuario } 
            });
        } else {
            res.json({ success: false, message: 'Email ou senha inválidos.' });
        }
    } catch (error) {
        console.error('Erro Login:', error);
        res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }
});

// ==================================================================
// 2. GESTÃO DE OPORTUNIDADES (CRUD)
// ==================================================================

// ROTA: CRIAR NOVA OPORTUNIDADE (Com Upload de Imagem)
// Lógica "Find or Create": Verifica se a ONG e o Tipo já existem antes de criar.
app.post('/api/oportunidades', upload.single('imagem'), async (req, res) => {
    try {
        const dados = req.body;
        const arquivo = req.file;

        console.log("Criando oportunidade. Dados recebidos:", dados);

        // A. Trata a Instituição (ONG)
        // Procura pelo nome. Se não achar, cria uma nova para gerar o ID.
        let instituicao = await prisma.instituicao.findFirst({
            where: { nomeInstituicao: dados.ongNome }
        });

        if (!instituicao) {
            console.log("Instituição não existe, criando nova:", dados.ongNome);
            instituicao = await prisma.instituicao.create({
                data: {
                    nomeInstituicao: dados.ongNome,
                    email_contato: dados.emailContato,
                    telefone_contato: dados.telefoneContato
                }
            });
        }

        // B. Trata o Tipo de Voluntariado
        // Procura pelo nome (ex: "Meio Ambiente"). Se não achar, cria.
        let tipoVol = await prisma.tipo_voluntariado.findFirst({
            where: { tipo: dados.tipoAtividade }
        });

        if (!tipoVol) {
            console.log("Tipo não existe, criando novo:", dados.tipoAtividade);
            tipoVol = await prisma.tipo_voluntariado.create({
                data: { tipo: dados.tipoAtividade }
            });
        }

        // C. Define imagem (se não enviou, usa uma padrão)
        const imagemUrl = arquivo ? `uploads/${arquivo.filename}` : 'images/explorar-pintura.jpeg';

        // D. Cria a Oportunidade final conectando os IDs encontrados acima
        const novaOportunidade = await prisma.oportunidade.create({
            data: {
                titulo: dados.titulo,
                descricao: dados.descricao,
                data_evento: new Date(dados.data), // Converte string data para Objeto Date
                horario: dados.horario,
                duracao_horas: parseInt(dados.duracao) || 0,
                local_evento: `${dados.cidade}, ${dados.pais} (${dados.formato})`,
                num_vagas: parseInt(dados.numVoluntarios) || 0,
                habilidades_desejadas: dados.habilidades,
                imagem_url: imagemUrl,
                
                // Conexões (Foreign Keys)
                usuario_cpf_criador: parseInt(dados.usuario_cpf),
                instituicao_idinstituicao: instituicao.idinstituicao,
                tipo_voluntariado_idtipo_voluntariado: tipoVol.idtipo_voluntariado
            },
        });

        console.log("Oportunidade criada com ID:", novaOportunidade.idoportunidade);
        res.json({ success: true, id: novaOportunidade.idoportunidade });

    } catch (error) {
        console.error('Erro ao criar oportunidade:', error);
        res.status(500).json({ success: false, message: 'Erro ao salvar no banco: ' + error.message });
    }
});

// ROTA: LISTAR TODAS AS OPORTUNIDADES
// Traz dados completos (incluindo nome da ONG e Tipo) para exibir nos cards
app.get('/api/oportunidades', async (req, res) => {
    try {
        const oportunidades = await prisma.oportunidade.findMany({
            include: { 
                instituicao: true,
                tipo_voluntariado: true 
            }, 
            orderBy: { idoportunidade: 'desc' } // As mais recentes primeiro
        });
        res.json(oportunidades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar oportunidades' });
    }
});

// ROTA: BUSCAR DETALHES DE UMA OPORTUNIDADE (Por ID)
// Usada na página 'explorar-detalhe.html'
app.get('/api/oportunidades/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        const oportunidade = await prisma.oportunidade.findUnique({
            where: { idoportunidade: id },
            include: { 
                instituicao: true, 
                tipo_voluntariado: true 
            }
        });

        if (oportunidade) {
            res.json(oportunidade);
        } else {
            res.status(404).json({ error: "Oportunidade não encontrada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar detalhes" });
    }
});

// ROTA: EXCLUIR OPORTUNIDADE (Com Transação e Segurança)
// 1. Verifica se quem pediu é o dono.
// 2. Usa transação para apagar primeiro as dependências (inscrições, testemunhos) e depois a oportunidade.
app.delete('/api/oportunidades/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const usuario_cpf = parseInt(req.body.usuario_cpf); 

    try {
        // Verifica existência
        const oportunidade = await prisma.oportunidade.findUnique({
            where: { idoportunidade: id }
        });

        if (!oportunidade) {
            return res.status(404).json({ success: false, message: "Oportunidade não existe." });
        }

        // Verifica permissão (Dono)
        if (oportunidade.usuario_cpf_criador !== usuario_cpf) {
            return res.status(403).json({ success: false, message: "Você não tem permissão para excluir." });
        }

        // Executa a deleção em cadeia (Cascata manual)
        await prisma.$transaction([
            prisma.inscricao.deleteMany({ 
                where: { oportunidade_idoportunidade: id } 
            }),
            prisma.testemunhos.deleteMany({ 
                where: { oportunidade_idoportunidade: id } 
            }),
            prisma.oportunidade.delete({ 
                where: { idoportunidade: id } 
            })
        ]);

        res.json({ success: true, message: "Oportunidade excluída com sucesso!" });

    } catch (error) {
        console.error("ERRO NO SERVIDOR:", error);
        res.status(500).json({ success: false, message: "Erro no banco de dados: " + error.message });
    }
});

// ==================================================================
// 3. GESTÃO DE INSCRIÇÕES
// ==================================================================

// ROTA: REALIZAR INSCRIÇÃO
// Verifica se o usuário já não está inscrito antes de salvar.
app.post('/api/inscricao', async (req, res) => {
    const { usuario_cpf, oportunidade_id } = req.body;

    try {
        const cpfInt = parseInt(usuario_cpf);
        const opIdInt = parseInt(oportunidade_id);

        // Verifica duplicidade
        const jaInscrito = await prisma.inscricao.findFirst({
            where: {
                usuario_cpf: cpfInt,
                oportunidade_idoportunidade: opIdInt
            }
        });

        if (jaInscrito) {
            return res.status(400).json({ success: false, message: 'Você já está inscrito nesta oportunidade!' });
        }

        // Cria registro na tabela N:N (Inscrição)
        await prisma.inscricao.create({
            data: {
                usuario_cpf: cpfInt,
                oportunidade_idoportunidade: opIdInt,
                status: 'Inscrito',
                data_inscricao: new Date()
            }
        });

        res.json({ success: true, message: 'Inscrição realizada com sucesso!' });

    } catch (error) {
        console.error('Erro na inscrição:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar inscrição.' });
    }
});

// ROTA: LISTAR MINHAS ATIVIDADES
// Retorna inscrições de um usuário específico, filtrando apenas eventos futuros.
app.get('/api/minhas-atividades/:cpf', async (req, res) => {
    try {
        const cpf = parseInt(req.params.cpf);
        const hoje = new Date();

        const inscricoes = await prisma.inscricao.findMany({
            where: {
                usuario_cpf: cpf,
                oportunidade: {
                    data_evento: {
                        gte: hoje // 'gte' = Greater Than or Equal (Maior ou igual a hoje)
                    }
                }
            },
            include: {
                oportunidade: {
                    include: {
                        instituicao: true,
                        tipo_voluntariado: true
                    }
                }
            },
            orderBy: {
                oportunidade: {
                    data_evento: 'asc' // Mais próximas primeiro
                }
            }
        });

        res.json(inscricoes);

    } catch (error) {
        console.error("Erro ao buscar atividades:", error);
        res.status(500).json({ error: "Erro interno ao buscar atividades" });
    }
});

// ROTA: CANCELAR INSCRIÇÃO
// Remove o vínculo entre usuário e oportunidade.
app.delete('/api/inscricao', async (req, res) => {
    try {
        const { usuario_cpf, oportunidade_id } = req.body;

        await prisma.inscricao.delete({
            where: {
                // O Prisma exige a chave composta definida no schema
                usuario_cpf_oportunidade_idoportunidade: {
                    usuario_cpf: parseInt(usuario_cpf),
                    oportunidade_idoportunidade: parseInt(oportunidade_id)
                }
            }
        });

        res.json({ success: true, message: "Inscrição cancelada com sucesso." });

    } catch (error) {
        console.error("Erro ao cancelar inscrição:", error);
        res.status(500).json({ success: false, message: "Erro ao cancelar." });
    }
});

// ==================================================================
// 4. GESTÃO DE TESTEMUNHOS (FEEDBACK)
// ==================================================================

// ROTA: LISTAR TODOS OS TESTEMUNHOS
app.get('/api/testemunhos', async (req, res) => {
    try {
        const testemunhos = await prisma.testemunhos.findMany({
            include: {
                usuario: true,       // Inclui dados de quem escreveu
                oportunidade: true   // Inclui dados da atividade
            },
            orderBy: {
                idtestemunhos: 'desc'
            }
        });
        res.json(testemunhos);
    } catch (error) {
        console.error("Erro ao buscar testemunhos:", error);
        res.status(500).json({ error: "Erro ao carregar testemunhos" });
    }
});

// ROTA: CRIAR TESTEMUNHO
app.post('/api/testemunhos', async (req, res) => {
    try {
        const { usuario_cpf, oportunidade_id, texto } = req.body;

        if (!texto || !oportunidade_id) {
            return res.status(400).json({ success: false, message: "Dados incompletos." });
        }

        await prisma.testemunhos.create({
            data: {
                texto: texto,
                data: new Date(),
                usuario: { connect: { cpf: parseInt(usuario_cpf) } },
                oportunidade: { connect: { idoportunidade: parseInt(oportunidade_id) } }
            }
        });

        res.json({ success: true, message: "Testemunho publicado!" });

    } catch (error) {
        console.error("Erro ao criar testemunho:", error);
        res.status(500).json({ success: false, message: "Erro ao salvar." });
    }
});

// ROTA: EXCLUIR TESTEMUNHO (Com verificação de Dono)
app.delete('/api/testemunhos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { usuario_cpf } = req.body;

        const testemunho = await prisma.testemunhos.findUnique({
            where: { idtestemunhos: id }
        });

        if (!testemunho) {
            return res.status(404).json({ success: false, message: "Testemunho não encontrado." });
        }

        // Segurança: Só apaga se o CPF bater
        if (testemunho.usuario_cpf !== parseInt(usuario_cpf)) {
            return res.status(403).json({ success: false, message: "Você não é o autor deste depoimento." });
        }

        await prisma.testemunhos.delete({
            where: { idtestemunhos: id }
        });

        res.json({ success: true, message: "Testemunho excluído." });

    } catch (error) {
        console.error("Erro ao excluir testemunho:", error);
        res.status(500).json({ success: false, message: "Erro interno." });
    }
});
 
// ==================================================================
// 5. PAINEL INICIAL DE ESTATÍSTICAS
// ==================================================================

// ROTA: ESTATÍSTICAS DA HOME
// Calcula totais gerais e dados específicos do usuário logado.
app.get('/api/estatisticas/:cpf', async (req, res) => {
    try {
        const cpf = parseInt(req.params.cpf);
        const agora = new Date();

        // 1. Total de Oportunidades no sistema
        const totalOportunidades = await prisma.oportunidade.count();
        
        // 2. Total de Voluntários Ativos (CPFs únicos)
        // Agrupa por CPF para contar quantas PESSOAS existem, independente de quantas inscrições tenham.
        const agrupamentoVoluntarios = await prisma.inscricao.groupBy({
            by: ['usuario_cpf'],
        });
        const totalVoluntariados = agrupamentoVoluntarios.length;

        // 3. Estatísticas Pessoais (Horas e Status)
        const minhasInscricoes = await prisma.inscricao.findMany({
            where: { usuario_cpf: cpf },
            include: { oportunidade: true }
        });

        let minhasHoras = 0;
        let atividadesConcluidas = 0;
        let proximasAtividades = 0;

        minhasInscricoes.forEach(inscricao => {
            const dataEvento = new Date(inscricao.oportunidade.data_evento);
            const duracao = inscricao.oportunidade.duracao_horas || 0;

            if (dataEvento < agora) {
                // Se já passou da data, conta como concluída e soma as horas
                atividadesConcluidas++;
                minhasHoras += duracao;
            } else {
                // Se é futura, conta como próxima
                proximasAtividades++;
            }
        });

        res.json({
            totalOportunidades,
            totalVoluntariados, 
            minhasHoras,
            atividadesConcluidas,
            proximasAtividades
        });

    } catch (error) {
        console.error("Erro ao calcular estatísticas:", error);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// --- INICIALIZAÇÃO ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});