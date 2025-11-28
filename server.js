// ==================================================================
// ARQUIVO: server.js
// PROJETO: Voluntariado Liferay
// DESCRIÇÃO: Servidor Back-end (API REST)
// TECNOLOGIAS: Node.js, Express, Prisma ORM, MySQL, Multer
// RESPONSABILIDADE: Gerenciar todas as regras de negócio, autenticação, uploads e comunicação com o Banco de Dados.
// ==================================================================

const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer'); // Middleware para upload de arquivos (imagens)

const app = express();
const prisma = new PrismaClient(); // Cliente de conexão com o DB
const PORT = process.env.PORT || 3000;

// --- CONFIGURAÇÃO DE UPLOAD (MULTER) ---
// Define o local de armazenamento e a estratégia de nomeação dos arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Pasta onde as imagens serão salvas
    },
    filename: function (req, file, cb) {
        // Adiciona timestamp (Date.now) para garantir nomes únicos e evitar sobrescrita
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// --- MIDDLEWARES GLOBAIS ---
app.use(express.json()); // Habilita leitura de JSON no corpo das requisições (req.body)
app.use(express.static(path.join(__dirname, ''))); // Serve arquivos estáticos do Front-end (HTML, CSS, JS)
app.use('/uploads', express.static('uploads')); // Torna a pasta de uploads acessível publicamente via URL

// ==================================================================
// 1. MÓDULO DE AUTENTICAÇÃO
// ==================================================================

/**
 * ROTA: LOGIN
 * Método: POST
 * Descrição: Verifica credenciais do usuário.
 * Retorno: Dados básicos do usuário (CPF, Nome) para sessão no front-end.
 */
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        // Busca usuário pelo email
        const usuario = await prisma.usuario.findFirst({ where: { email: email } });
        
        // Validação simples (Nota: Em produção, usar hash/bcrypt para senha)
        if (usuario && usuario.senha === senha) {
            res.json({ 
                success: true, 
                user: { cpf: usuario.cpf, nome: usuario.nomeUsuario } 
            });
        } else {
            res.json({ success: false, message: 'Email ou senha inválidos.' });
        }
    } catch (error) { 
        res.status(500).json({ success: false, message: "Erro interno." }); 
    }
});

// ==================================================================
// 2. MÓDULO DE OPORTUNIDADES (CRUD)
// ==================================================================

/**
 * ROTA: CRIAR OPORTUNIDADE
 * Método: POST
 * Descrição: Cria uma nova oportunidade, lidando com relacionamentos (ONG, Tipo).
 * Lógica: Usa 'Find or Create' para Instituição e Tipo de Voluntariado para evitar duplicatas.
 */
app.post('/api/oportunidades', upload.single('imagem'), async (req, res) => {
    try {
        const dados = req.body;
        const arquivo = req.file;
        
        // 1. Verifica/Cria Instituição (ONG)
        let instituicao = await prisma.instituicao.findFirst({ where: { nomeInstituicao: dados.ongNome } });
        if (!instituicao) {
            instituicao = await prisma.instituicao.create({
                data: { 
                    nomeInstituicao: dados.ongNome, 
                    email_contato: dados.emailContato, 
                    telefone_contato: dados.telefoneContato 
                }
            });
        }

        // 2. Verifica/Cria Tipo de Voluntariado (Categoria)
        let tipoVol = await prisma.tipo_voluntariado.findFirst({ where: { tipo: dados.tipoAtividade } });
        if (!tipoVol) {
            tipoVol = await prisma.tipo_voluntariado.create({ data: { tipo: dados.tipoAtividade } });
        }

        // 3. Define Imagem (Upload ou Padrão)
        const imgPath = arquivo ? `uploads/${arquivo.filename}` : 'images/explorar-pintura.jpeg';

        // 4. Cria a Oportunidade final
        await prisma.oportunidade.create({
            data: {
                titulo: dados.titulo,
                descricao: dados.descricao,
                data_evento: new Date(dados.data), // Converte string para Data
                horario: dados.horario,
                duracao_horas: parseInt(dados.duracao) || 0,
                local_evento: `${dados.cidade}, ${dados.pais} (${dados.formato})`,
                num_vagas: parseInt(dados.numVoluntarios) || 0,
                habilidades_desejadas: dados.habilidades,
                imagem_url: imgPath,
                usuario_cpf_criador: parseInt(dados.usuario_cpf),
                instituicao_idinstituicao: instituicao.idinstituicao,
                tipo_voluntariado_idtipo_voluntariado: tipoVol.idtipo_voluntariado
            },
        });
        res.json({ success: true });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
});

/**
 * ROTA: LISTAR OPORTUNIDADES
 * Método: GET
 * Descrição: Retorna todas as oportunidades ordenadas por data de criação (desc).
 */
app.get('/api/oportunidades', async (req, res) => {
    const oportunidades = await prisma.oportunidade.findMany({
        include: { instituicao: true, tipo_voluntariado: true }, // JOIN para trazer nomes
        orderBy: { idoportunidade: 'desc' }
    });
    res.json(oportunidades);
});

/**
 * ROTA: DETALHES DA OPORTUNIDADE
 * Método: GET (por ID)
 * Descrição: Busca uma oportunidade específica para a página de detalhes.
 */
app.get('/api/oportunidades/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const oportunidade = await prisma.oportunidade.findUnique({
        where: { idoportunidade: id },
        include: { instituicao: true, tipo_voluntariado: true }
    });
    res.json(oportunidade || {});
});

/**
 * ROTA: EXCLUIR OPORTUNIDADE
 * Método: DELETE
 * Descrição: Exclui uma oportunidade e todos os seus dados relacionados.
 * Segurança: Verifica se o usuário logado é o criador (dono).
 * Integridade: Usa TRANSACTION para apagar inscrições e testemunhos antes da oportunidade.
 */
app.delete('/api/oportunidades/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const usuario_cpf = parseInt(req.body.usuario_cpf); 
    try {
        const op = await prisma.oportunidade.findUnique({ where: { idoportunidade: id } });
        
        // Verificação de segurança
        if (!op) return res.status(404).json({ message: "Não encontrada" });
        if (op.usuario_cpf_criador !== usuario_cpf) return res.status(403).json({ message: "Acesso negado: Apenas o criador pode excluir." });

        // Delete em cascata manual
        await prisma.$transaction([
            prisma.inscricao.deleteMany({ where: { oportunidade_idoportunidade: id } }),
            prisma.testemunhos.deleteMany({ where: { oportunidade_idoportunidade: id } }),
            prisma.oportunidade.delete({ where: { idoportunidade: id } })
        ]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// ==================================================================
// ROTAS DE EDIÇÃO (UPDATE)
// ==================================================================

// 1. ATUALIZAR TESTEMUNHO
app.put('/api/testemunhos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { usuario_cpf, texto } = req.body;

        // Verifica se existe
        const testemunho = await prisma.testemunhos.findUnique({ where: { idtestemunhos: id } });
        if (!testemunho) return res.status(404).json({ message: "Não encontrado." });

        // Verifica dono
        if (testemunho.usuario_cpf !== parseInt(usuario_cpf)) {
            return res.status(403).json({ message: "Sem permissão." });
        }

        // Atualiza
        await prisma.testemunhos.update({
            where: { idtestemunhos: id },
            data: { texto: texto }
        });

        res.json({ success: true, message: "Depoimento atualizado!" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Erro ao atualizar." });
    }
});

// 2. ATUALIZAR OPORTUNIDADE
app.put('/api/oportunidades/:id', upload.single('imagem'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const dados = req.body;
        const arquivo = req.file;

        // Verifica existência
        const op = await prisma.oportunidade.findUnique({ where: { idoportunidade: id } });
        if (!op) return res.status(404).json({ message: "Não encontrada." });

        // Verifica dono
        if (op.usuario_cpf_criador !== parseInt(dados.usuario_cpf)) {
            return res.status(403).json({ message: "Apenas o criador pode editar." });
        }

        // Lógica para atualizar ONG e Tipo (se mudou)
        // (Simplificação: Aqui buscamos ou criamos novamente para garantir que o ID esteja certo)
        
        let instituicao = await prisma.instituicao.findFirst({ where: { nomeInstituicao: dados.ongNome } });
        if (!instituicao) {
            instituicao = await prisma.instituicao.create({
                data: { nomeInstituicao: dados.ongNome, email_contato: dados.emailContato, telefone_contato: dados.telefoneContato }
            });
        }

        let tipoVol = await prisma.tipo_voluntariado.findFirst({ where: { tipo: dados.tipoAtividade } });
        if (!tipoVol) {
            tipoVol = await prisma.tipo_voluntariado.create({ data: { tipo: dados.tipoAtividade } });
        }

        // Prepara objeto de atualização
        const updateData = {
            titulo: dados.titulo,
            descricao: dados.descricao,
            data_evento: new Date(dados.data),
            horario: dados.horario,
            duracao_horas: parseInt(dados.duracao),
            local_evento: `${dados.cidade}, ${dados.pais} (${dados.formato})`,
            num_vagas: parseInt(dados.numVoluntarios),
            habilidades_desejadas: dados.habilidades,
            // Atualiza FKs
            instituicao_idinstituicao: instituicao.idinstituicao,
            tipo_voluntariado_idtipo_voluntariado: tipoVol.idtipo_voluntariado
        };

        // Só atualiza a imagem se o usuário enviou uma nova
        if (arquivo) {
            updateData.imagem_url = `uploads/${arquivo.filename}`;
        }

        await prisma.oportunidade.update({
            where: { idoportunidade: id },
            data: updateData
        });

        res.json({ success: true, message: "Oportunidade atualizada!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================================================================
// 3. MÓDULO DE INSCRIÇÃO
// ==================================================================

/**
 * ROTA: INSCREVER-SE
 * Método: POST
 * Descrição: Cria vínculo entre Usuário e Oportunidade.
 */
app.post('/api/inscricao', async (req, res) => {
    try {
        await prisma.inscricao.create({
            data: {
                usuario_cpf: parseInt(req.body.usuario_cpf),
                oportunidade_idoportunidade: parseInt(req.body.oportunidade_id),
                data_inscricao: new Date()
            }
        });
        res.json({ success: true });
    } catch (e) { 
        // Erro P2002 do Prisma indica violação de chave única (já inscrito)
        res.status(500).json({ success: false, message: "Erro ao inscrever ou já inscrito." }); 
    }
});

/**
 * ROTA: MINHAS ATIVIDADES
 * Método: GET
 * Descrição: Retorna inscrições futuras de um usuário específico.
 */
app.get('/api/minhas-atividades/:cpf', async (req, res) => {
    const hoje = new Date();
    const inscricoes = await prisma.inscricao.findMany({
        where: { 
            usuario_cpf: parseInt(req.params.cpf), 
            oportunidade: { data_evento: { gte: hoje } } // Apenas eventos futuros
        },
        include: { oportunidade: { include: { instituicao: true, tipo_voluntariado: true } } },
        orderBy: { oportunidade: { data_evento: 'asc' } }
    });
    res.json(inscricoes);
});

/**
 * ROTA: CANCELAR INSCRIÇÃO
 * Método: DELETE
 * Descrição: Remove o vínculo de inscrição.
 */
app.delete('/api/inscricao', async (req, res) => {
    await prisma.inscricao.delete({
        where: { 
            usuario_cpf_oportunidade_idoportunidade: { 
                usuario_cpf: parseInt(req.body.usuario_cpf), 
                oportunidade_idoportunidade: parseInt(req.body.oportunidade_id) 
            } 
        }
    });
    res.json({ success: true });
});

// ==================================================================
// 4. MÓDULO DE TESTEMUNHOS (FEEDBACK)
// ==================================================================

app.get('/api/testemunhos', async (req, res) => {
    const t = await prisma.testemunhos.findMany({ 
        include: { usuario: true, oportunidade: true }, 
        orderBy: { idtestemunhos: 'desc' } 
    });
    res.json(t);
});

app.post('/api/testemunhos', async (req, res) => {
    await prisma.testemunhos.create({
        data: { 
            texto: req.body.texto, 
            data: new Date(), 
            usuario: { connect: { cpf: parseInt(req.body.usuario_cpf) } }, 
            oportunidade: { connect: { idoportunidade: parseInt(req.body.oportunidade_id) } } 
        }
    });
    res.json({ success: true });
});

app.delete('/api/testemunhos/:id', async (req, res) => {
    const t = await prisma.testemunhos.findUnique({ where: { idtestemunhos: parseInt(req.params.id) } });
    // Validação de dono
    if (t.usuario_cpf !== parseInt(req.body.usuario_cpf)) return res.status(403).json({});
    await prisma.testemunhos.delete({ where: { idtestemunhos: parseInt(req.params.id) } });
    res.json({ success: true });
});

// ==================================================================
// 5. MÓDULO DE ESTATÍSTICAS E IMPACTO (DASHBOARDS)
// ==================================================================

/**
 * ROTA: DASHBOARD PESSOAL (HOME)
 * Método: GET
 * Descrição: Retorna números para os cards da Home.
 */
app.get('/api/estatisticas/:cpf', async (req, res) => {
    const cpf = parseInt(req.params.cpf);
    const agora = new Date();
    
    // Estatísticas Gerais
    const totalOps = await prisma.oportunidade.count();
    // Conta CPFs únicos para saber total de voluntários reais
    const groupVols = await prisma.inscricao.groupBy({ by: ['usuario_cpf'] });
    
    // Estatísticas Pessoais
    const minhasIns = await prisma.inscricao.findMany({ where: { usuario_cpf: cpf }, include: { oportunidade: true } });
    
    let horas = 0, concluidas = 0, proximas = 0;
    minhasIns.forEach(i => {
        if (new Date(i.oportunidade.data_evento) < agora) { 
            concluidas++; 
            horas += (i.oportunidade.duracao_horas || 0); 
        } else { 
            proximas++; 
        }
    });
    
    res.json({ 
        totalOportunidades: totalOps, 
        totalVoluntariados: groupVols.length, 
        minhasHoras: horas, 
        atividadesConcluidas: concluidas, 
        proximasAtividades: proximas 
    });
});

/**
 * ROTA: IMPACTO GLOBAL (PÁGINA IMPACTO)
 * Método: GET
 * Descrição: Cálculos complexos para gráficos e relatórios globais.
 */
app.get('/api/impacto-global', async (req, res) => {
    try {
        const agora = new Date();

        // A. TOTAIS GERAIS
        // Busca inscrições passadas para somar horas reais realizadas
        const inscricoesPassadas = await prisma.inscricao.findMany({
            where: { oportunidade: { data_evento: { lt: agora } } },
            include: { oportunidade: true }
        });
        let horasTotais = 0;
        inscricoesPassadas.forEach(i => horasTotais += (i.oportunidade.duracao_horas || 0));

        // Contagens simples
        const voluntariosUnicos = (await prisma.inscricao.groupBy({ by: ['usuario_cpf'] })).length;
        const atividadesConcluidas = await prisma.oportunidade.count({ where: { data_evento: { lt: agora } } });
        const oportunidadesCriadas = await prisma.oportunidade.count();

        // B. DADOS MENSAIS (GRÁFICOS DE LINHA/BARRA)
        // Calcula engajamento nos últimos 6 meses
        const seisMesesAtras = new Date();
        seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

        const inscricoesRecentes = await prisma.inscricao.findMany({
            where: { data_inscricao: { gte: seisMesesAtras } },
            include: { oportunidade: true }
        });

        // Inicializa arrays para o Chart.js
        const mesesLabels = [];
        const dadosHoras = [0, 0, 0, 0, 0, 0];
        const dadosVoluntarios = [0, 0, 0, 0, 0, 0];
        
        // Gera labels dos últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            mesesLabels.push(d.toLocaleDateString('pt-BR', { month: 'short' }));
        }

        // Preenche os dados nos meses corretos
        inscricoesRecentes.forEach(ins => {
            const mesIndex = 5 - (new Date().getMonth() - new Date(ins.data_inscricao).getMonth());
            if (mesIndex >= 0 && mesIndex <= 5) {
                dadosVoluntarios[mesIndex]++;
                dadosHoras[mesIndex] += (ins.oportunidade.duracao_horas || 0);
            }
        });

        // C. RANKING DE VOLUNTÁRIOS
        // Agrupa inscrições por usuário e ordena decrescente
        const rankingRaw = await prisma.inscricao.groupBy({
            by: ['usuario_cpf'],
            _count: { usuario_cpf: true },
            orderBy: { _count: { usuario_cpf: 'desc' } },
            take: 5 // Apenas Top 5
        });

        const rankingDetalhado = await Promise.all(rankingRaw.map(async (r) => {
            const u = await prisma.usuario.findUnique({ where: { cpf: r.usuario_cpf } });
            return { nome: u ? u.nomeUsuario : 'Anônimo', qtd: r._count.usuario_cpf };
        }));

        // D. GEOGRAFIA
        const geoRaw = await prisma.oportunidade.findMany({ select: { local_evento: true, duracao_horas: true } });
        const cidadesMap = {};
        let onlineCount = 0;

        geoRaw.forEach(op => {
            if (op.local_evento.toLowerCase().includes('online')) {
                onlineCount++;
            } else {
                const cidade = op.local_evento.split(',')[0].trim();
                if (!cidadesMap[cidade]) cidadesMap[cidade] = { count: 0 };
                cidadesMap[cidade].count++;
            }
        });

        const listaGeografia = Object.keys(cidadesMap).map(cidade => ({
            cidade, 
            count: cidadesMap[cidade].count
        }));

        // E. CATEGORIAS (PIZZA)
        const catRaw = await prisma.oportunidade.groupBy({
            by: ['tipo_voluntariado_idtipo_voluntariado'],
            _count: { idoportunidade: true }
        });
        const categorias = await Promise.all(catRaw.map(async (c) => {
            const t = await prisma.tipo_voluntariado.findUnique({ where: { idtipo_voluntariado: c.tipo_voluntariado_idtipo_voluntariado } });
            return { nome: t ? t.tipo : 'Outros', quantidade: c._count.idoportunidade };
        }));

        // Retorna JSON estruturado para o Front-end
        res.json({
            totais: { horasTotais, voluntariosUnicos, atividadesConcluidas, oportunidadesCriadas },
            mensal: { labels: mesesLabels, horas: dadosHoras, voluntarios: dadosVoluntarios },
            ranking: rankingDetalhado,
            geografia: { cidades: listaGeografia, online: onlineCount },
            categorias: categorias
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro no impacto" });
    }
});

/**
 * ROTA: PERFIL COMPLETO
 * Método: GET
 * Descrição: Retorna dados do usuário, estatísticas pessoais e retrospectiva anual.
 */
app.get('/api/perfil/:cpf', async (req, res) => {
    try {
        const cpf = parseInt(req.params.cpf);
        const agora = new Date();
        const anoAtual = agora.getFullYear();

        const usuario = await prisma.usuario.findUnique({ where: { cpf: cpf } });
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

        const inscricoes = await prisma.inscricao.findMany({
            where: { usuario_cpf: cpf },
            include: { oportunidade: { include: { instituicao: true, tipo_voluntariado: true } } },
            orderBy: { oportunidade: { data_evento: 'desc' } }
        });

        let horasTotais = 0, concluidas = 0, proximas = 0;
        let retroCount = 0, retroHoras = 0;
        const retroCausas = {}; 

        const historico = inscricoes.map(ins => {
            const op = ins.oportunidade;
            const dataEvento = new Date(op.data_evento);
            const isPassado = dataEvento < agora;
            const tipo = op.tipo_voluntariado ? op.tipo_voluntariado.tipo : 'Geral';

            if (isPassado) {
                concluidas++;
                horasTotais += (op.duracao_horas || 0);

                // Cálculo da Retrospectiva Anual
                if (dataEvento.getFullYear() === anoAtual) {
                    retroCount++;
                    retroHoras += (op.duracao_horas || 0);
                    retroCausas[tipo] = (retroCausas[tipo] || 0) + 1;
                }
            } else {
                proximas++;
            }

            return {
                id: op.idoportunidade,
                titulo: op.titulo,
                data: op.data_evento,
                status: isPassado ? 'Concluído' : 'Inscrito',
                tipo: tipo,
                instituicao: op.instituicao ? op.instituicao.nomeInstituicao : 'ONG'
            };
        });

        // Define causa favorita (a que mais se repetiu no ano)
        let causaFavorita = "---";
        let maxCount = 0;
        for (const [causa, count] of Object.entries(retroCausas)) {
            if (count > maxCount) { maxCount = count; causaFavorita = causa; }
        }

        res.json({
            usuario: { nome: usuario.nomeUsuario, email: usuario.email, iniciais: usuario.nomeUsuario.charAt(0).toUpperCase() },
            estatisticas: { horasTotais, atividadesConcluidas: concluidas, proximasAtividades: proximas, totalParticipacoes: inscricoes.length },
            historico: historico,
            retrospectiva: {
                ano: anoAtual,
                atividades: retroCount,
                horas: retroHoras,
                causa: causaFavorita
            }
        });

    } catch (error) { console.error(error); res.status(500).json({ error: "Erro no servidor" }); }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => { console.log(`🚀 Servidor rodando na porta ${PORT}`); });