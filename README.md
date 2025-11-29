# Voluntariado Liferay

## 📖 Sobre o Projeto

O Voluntariado Liferay é uma aplicação web completa desenvolvida para conectar voluntários a oportunidades de ação social. O objetivo principal é facilitar o engajamento comunitário, permitindo que organizações publiquem suas causas e que voluntários encontrem, se inscrevam e gerenciem suas participações de forma intuitiva. O projeto foi construído com foco na integridade dos dados, onde cada usuário possui um perfil único, histórico pessoal e permissões específicas (como editar/excluir apenas seus próprios conteúdos). Além disso, a plataforma oferece dashboards de impacto social com dados em tempo real.

### Principais Diferenciais

- ✅ Interface intuitiva e responsiva
- ✅ Sistema completo de CRUD para oportunidades
- ✅ Gestão de inscrições com cancelamento
- ✅ Painel estatístico de impacto com métricas globais e pessoais
- ✅ Retrospectiva anual do voluntário
- ✅ Sistema de testemunhos com edição/exclusão
- ✅ Upload de imagens para oportunidades
- ✅ Busca e filtros em tempo real

---

## 🚀 Funcionalidades

- 📝 Criar e editar oportunidades de voluntariado
- 🔍 Explorar oportunidades com busca e filtros
- ✍️ Inscrever-se em atividades
- 📊 Visualizar horas acumuladas e impacto pessoal
- 💬 Deixar testemunhos sobre experiências
- 🎉 Acessar retrospectiva anual
- 📈 Painel de impacto global e pessoal
- 👥 Ranking de voluntários mais engajados
- 🗺️ Análise geográfica das atividades
- 📊 Gráficos de evolução mensal
- 🏷️ Distribuição por categorias

---

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#️-instalação)
- [Configuração do Banco de Dados](#️-configuração-do-banco-de-dados)
- [Executando o Projeto](#️-executando-o-projeto)
- [Deploy em produção](#️-deploy-em-produção)
- [Estrutura do Banco de Dados](#️-estrutura-do-banco-de-dados)
- [Rotas da API](#-rotas-da-api)
- [Páginas do Sistema](#️-páginas-do-sistema)
- [Personalização](#-personalização)
- [Troubleshooting](#-troubleshooting)
- [Roadmap (Próximas Funcionalidades)](#️-(próximas-funcionalidades))
- [Licença](#-licença)
- [Agradecimentos](#-agradecimentos)

---

## 🛠 Tecnologias

### **Front-end**
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **HTML5** | - | Estrutura semântica das páginas |
| **CSS3** | - | Estilização responsiva e moderna |
| **JavaScript (Vanilla)** | ES6+ | Interatividade e consumo de API |
| **Font Awesome** | 6.5.2 | Biblioteca de ícones |
| **Chart.js** | CDN | Visualização de dados em gráficos |

### **Back-end**
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **Node.js** | 18+ | Runtime JavaScript no servidor |
| **Express** | 5.1.0 | Framework web para APIs REST |
| **Prisma ORM** | 6.19.0 | Modelagem e queries do banco de dados |
| **Multer** | 2.0.2 | Processamento de uploads de arquivos |

### **Banco de Dados**
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **MySQL** | 8.0+ | Banco de dados relacional |

### **Cloud e Deploy**
| Serviço | Função |
|---------|--------|
| **Render** | Hospedagem da aplicação (Back-end + Front-end) |
| **Aiven** | Banco de dados MySQL gerenciado na nuvem |
| **Cloudinary** | Armazenamento e CDN para imagens |
| **GitHub** | Versionamento e CI/CD |

### **Ferramentas de Desenvolvimento**
- **Dotenv** (17.2.3) - Gerenciamento de variáveis de ambiente
- **Git** - Controle de versão

---

## 📁 Estrutura do Projeto

```
Voluntariado-Liferay/
├── node_modules               # Ambiente de execução JavaScript
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── uploads/                   # Diretório de imagens
├── images/                    # Imagens estáticas
├── server.js                  # Servidor Express e rotas da API
├── app.js                     # Lógica global do frontend
├── style.css                  # Estilos globais
├── .env                       # URL de acesso ao banco de dados
├── package.json               # Dependências do projeto
│
├── login.html                 # Página de autenticação
├── inicio.html                # Dashboard principal
├── explorar.html              # Lista de oportunidades
├── explorar-detalhe.html      # Detalhes de uma oportunidade específica
├── criar-oportunidade.html    # Formulário de criação/edição de um voluntariado
├── MeuPerfil.html             # Perfil e retrospectiva do usuário
├── impacto.html               # Métricas globais
└── testemunhos.html           # Depoimentos/feedback da comunidade
```

#### Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO               │
│  (HTML + CSS + JavaScript Vanilla)                     │
│  ├─ login.html                                          │
│  ├─ inicio.html                                         │
│  ├─ explorar.html                                       │
│  ├─ criar-oportunidade.html                            │
│  ├─ impacto.html                                        │
│  ├─ testemunhos.html                                    │
│  └─ MeuPerfil.html                                      │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE APLICAÇÃO                   │
│  (Node.js + Express.js)                                 │
│  ├─ Autenticação (POST /api/login)                     │
│  ├─ CRUD Oportunidades (GET, POST, PUT, DELETE)        │
│  ├─ Sistema de Inscrições                              │
│  ├─ Gestão de Testemunhos                              │
│  ├─ Estatísticas e Dashboards                          │
│  └─ Upload de Arquivos (Multer → Cloudinary)           │
└─────────────────────────────────────────────────────────┘
                          ↕ Prisma ORM
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE PERSISTÊNCIA                │
│  (MySQL via Aiven Cloud)                                │
│  ├─ Tabela: usuario                                     │
│  ├─ Tabela: oportunidade                               │
│  ├─ Tabela: inscricao                                  │
│  ├─ Tabela: testemunhos                                │
│  ├─ Tabela: instituicao                                │
│  ├─ Tabela: tipo_voluntariado                          │
│  └─ Tabela: endereco                                   │
└─────────────────────────────────────────────────────────┘
```
### Fluxo de Dados - Exemplo de Criação de Oportunidade

```
Usuário preenche formulário
         ↓
JavaScript captura dados e envia (POST /api/oportunidades)
         ↓
Multer processa imagem → Cloudinary armazena → Retorna URL
         ↓
Prisma valida e insere dados no MySQL (Aiven)
         ↓
Servidor responde {success: true}
         ↓
Interface atualiza e redireciona para explorar.html
```

---

## 📦 Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Node.js** 18.x ou superior ([Download](https://nodejs.org/))
- **MySQL** 8.x ou superior ([Download](https://www.mysql.com/downloads/))
- **Git** ([Download](https://git-scm.com/))

---

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Antonio-avsp/Telas-Liferay-1.5.git
```

### 2. Instale as dependências
- Instale os pacotes necessários (Node.js, Express, Prisma, Multer e Dotenv) listados no package.json. Segue respectivamente os comandos para instalação:

```bash
npm install
```

```bash
npm install express
```

```bash
npm install -D prisma (Para instalar a ferramenta de desenvolvimento prisma)
npm install @prisma/client (Para instalar o cliente prisma)
npx prisma init (Comando final para iniciar o Prisma - Cria a pasta e o arquivo .env)
```

```bash
npm install multer
```

```bash
npm install dotenv
```

### 3. Configure as variáveis de ambiente

Edite o arquivo chamado .env na raiz do projeto e configure a URL de conexão com o SGBD que você esteja utilzando (o .env vem por padrão postgresql, então substitua pelo seu sgbd. Na url abaixo apresenta utilização "mysql://" por conta que utilizei esse SGBD na criação. Caso seja outro, edite para o que utilizas).

Substitua também 'usuario' e 'senha' pelas suas credenciais locais do MySQL (ou do sgbd que você esteja utilizando)
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/bd_liferay"
```

**Substitua:**
- `usuario` pelo seu usuário MySQL
- `senha` pela sua senha MySQL
- `bd_liferay` pelo nome do banco de dados

---

## 🗄️ Configuração do Banco de Dados

### 1. Crie o banco de dados
- Crie um novo schema (banco de dados) ou utilize o script fornecido.
- Execute o script SQL BD.Liferay.sql (localizado na raiz do projeto).
- Este script criará o banco bd_liferay, todas as tabelas (usuario, oportunidade, inscricao e etc.) e inserirá os dados iniciais de teste.

```sql
CREATE DATABASE bd_liferay;
```

### 2. Execute as migrações do Prisma

```bash
npx prisma migrate dev --name init
```

### 3. Gere o Prisma Client

```bash
npx prisma generate
```

### 4. (Opcional) Popule com dados de teste

- Você pode usar o Prisma Studio para adicionar dados manualmente:
```bash
npx prisma studio
```
- Ou com com comandos INSERT no próprio banco de dados, por exemplo:
```sql
INSERT INTO usuario (cpf, nomeUsuario, login, senha, email) 
VALUES (12345678900, 'João Silva', 'joao@exemplo.com', '123456', 'joao@exemplo.com');
```
---

## ▶️ Executando o Projeto

### 1. Instale o Ngrok

- Nota importante: Para usar o Ngrok, você precisa criar uma conta no site oficial (ngrok.com) para pegar seu Authtoken. Sem isso, a sessão expira muito rápido.
- É necessrio a utilização do Ngrok para rodar a aplicação em Localhost

```Bash
npm install -g ngrok
```

### 2. Configure seu Token de Autenticação 

- Substitua <SEU_TOKEN_AQUI> pelo código que aparece no painel do site do Ngrok.

```Bash
ngrok config add-authtoken <SEU_TOKEN_AQUI>
```

### 3. Comando para rodar (Exemplo).

- Se seu servidor Express estiver rodando na porta 3000, use este comando para gerar o link público.

```Bash
ngrok http 3000
```

### 4. Iniciar o servidor

- No primeiro terminal execute:
```
node server.js
```
>  Você verá a mensagem: 🚀 Servidor rodando em http:/localhost:3000

- Em outro terminal execute:
```
ngrok http 3000 
```
>  Você verá a mensagem: Session Status online

- Va no seu navegador e cole:
```
https://hilma-quadrophonics-loise.ngrok-free.dev/login.html
```
>  Se tudo deu certo você será direcionado para a página de Login


### 5. Credenciais de Teste

Para testar o sistema, crie um usuário diretamente no banco via Prisma Studio ou insira via SQL:

```sql
INSERT INTO usuario (cpf, nomeUsuario, login, senha, email) 
VALUES (12345678900, 'João Silva', 'joao@exemplo.com', '123456', 'joao@exemplo.com');
```
Usuários ja criados para teste 

```sql
INSERT INTO usuario (cpf, nomeUsuario, login, senha, email)
VALUES (123456789, 'Rafael', 'rafael', '123', 'rafael@exemplo.com')
VALUES (987654321, 'Fernanda', 'Fernanda', '878', 'fernanda@exemplo.com');
```
## ☁️ Deploy em Produção

### Arquitetura de Deploy

Para levar a aplicação do ambiente local para produção na web, utilizei uma arquitetura baseada em serviços gerenciados na nuvem:

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   RENDER     │ ───→ │    AIVEN     │      │  CLOUDINARY  │
│  (App Web)   │      │   (MySQL)    │      │   (Imagens)  │
│              │      │              │      │              │
│ Node.js +    │      │ Banco de     │      │ CDN Global   │
│ Express +    │      │ Dados        │      │ de Uploads   │
│ Front-end    │      │ Gerenciado   │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
       ↑                                            ↑
       │                                            │
       └────────────── GitHub (CI/CD) ─────────────┘
```

### 1️⃣ Preparação do Banco de Dados (Aiven)

**a) Crie uma conta gratuita em [aiven.io](https://aiven.io/)**

**b) Crie um serviço MySQL:**
- Selecione **MySQL 8**
- Escolha o plano **Free** (1GB)
- Selecione a região mais próxima (ex: São Paulo ou US East)

**c) Obtenha a string de conexão:**
```
mysql://usuario:senha@host-aiven.com:porta/banco?ssl-mode=REQUIRED
```

**d) Execute as migrations no banco da nuvem:**

Atualize temporariamente o `.env` com a URL do Aiven:

```env
DATABASE_URL="mysql://avnadmin:SENHA@host-aiven.com:12345/defaultdb?ssl-mode=REQUIRED"
```

Execute:
```bash
npx prisma migrate deploy
```

### 2️⃣ Configuração do Cloudinary

**a) Crie uma conta em [cloudinary.com](https://cloudinary.com/)**

**b) Obtenha as credenciais no Dashboard:**
- Cloud Name
- API Key
- API Secret

**c) Configure no Render (próximo passo)**

### 3️⃣ Deploy no Render

**a) Crie uma conta em [render.com](https://render.com/)**

**b) Conecte seu repositório GitHub**

**c) Crie um novo Web Service:**
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `node server.js`
- **Branch:** `main`

**d) Configure as variáveis de ambiente:**

No painel do Render, vá em **Environment** e adicione:

```
DATABASE_URL=mysql://avnadmin:SENHA@host-aiven.com:12345/defaultdb?ssl-mode=REQUIRED
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
PORT=3000
```

**e) Deploy Automático:**

A cada `git push` na branch `main`, o Render automaticamente:
1. Baixa o código atualizado
2. Instala dependências
3. Gera o cliente Prisma
4. Reinicia o servidor

### 4️⃣ Teste a Aplicação em Produção

Acesse a URL fornecida pelo Render:
```
https://seu-app.onrender.com
```


---

## 🗂️ Estrutura do Banco de Dados

### Tabelas presentes

| Tabela | Descrição |
|--------|-----------|
| `usuario` | Dados dos voluntários |
| `oportunidade` | Atividades de voluntariado |
| `instituicao` | ONGs e organizações parceiras |
| `inscricao` | Vínculo usuário-oportunidade |
| `testemunhos` | Depoimentos sobre experiências |
| `tipo_voluntariado` | Categorias (Educação, Meio Ambiente, etc.) |
| `endereco` | Endereço da oportunidade |

### Diagrama Entidade-Relacionamento (ER)

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    USUARIO      │       │   OPORTUNIDADE   │       │  INSTITUICAO    │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ cpf (PK)        │───┐   │ idoportunidade   │   ┌──│ idinstituicao   │
│ nomeUsuario     │   │   │ titulo           │   │  │ nomeInstituicao │
│ email           │   │   │ descricao        │   │  │ cnpj            │
│ senha           │   │   │ data_evento      │   │  │ email_contato   │
│ cargaHoraria    │   │   │ local_evento     │───┘  │ telefone_contato│
└─────────────────┘   │   │ imagem_url       │      └─────────────────┘
        │             │   │ usuario_cpf_criador│              │
        │             │   └──────────────────┘              │
        │             │             │                        │
        │             └─────────────┤                        │
        │                           │                        │
        ▼                           ▼                        ▼
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   INSCRICAO     │       │  TESTEMUNHOS     │       │   ENDERECO      │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ usuario_cpf (FK)│       │ idtestemunhos    │       │ idEndereco      │
│ oportunidade_id │       │ texto            │       │ rua             │
│ data_inscricao  │       │ data             │       │ cidade          │
│ status          │       │ usuario_cpf (FK) │       │ estado          │
└─────────────────┘       │ oportunidade_id  │       │ CEP             │
                          └──────────────────┘       └─────────────────┘
```

### Modelos Prisma (schema.prisma)

O esquema completo está definido em `prisma/schema.prisma`. Principais relações:

- **1:N** - Um usuário pode criar muitas oportunidades
- **N:M** - Usuários e Oportunidades (tabela intermediária: `inscricao`)
- **1:N** - Uma oportunidade pode ter muitos testemunhos
- **1:N** - Uma instituição pode estar em muitas oportunidades

---

## 🔌 Rotas da API

### Autenticação
```http
POST /api/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "senha": "123456"
}
```

### Oportunidades (CRUD)
```http
GET    /api/oportunidades           # Listar todas
GET    /api/oportunidades/:id       # Detalhes
POST   /api/oportunidades           # Criar (multipart/form-data)
PUT    /api/oportunidades/:id       # Atualizar
DELETE /api/oportunidades/:id       # Excluir
```

### Inscrições
```http
POST   /api/inscricao               # Inscrever-se
DELETE /api/inscricao               # Cancelar inscrição
GET    /api/minhas-atividades/:cpf  # Atividades futuras
```

### Testemunhos
```http
GET    /api/testemunhos              # Listar todos
POST   /api/testemunhos              # Criar
PUT    /api/testemunhos/:id          # Editar
DELETE /api/testemunhos/:id          # Excluir
```

### Estatísticas
```http
GET /api/estatisticas/:cpf           # Dados pessoais
GET /api/impacto-global              # Métricas da plataforma
GET /api/perfil/:cpf                 # Perfil completo + retrospectiva
```

---

## 🖥️ Páginas do Sistema

| Página | Rota | Descrição |
|--------|------|-----------|
| Login | `login.html` | Autenticação de usuários |
| Início | `inicio.html` | Dashboard com recomendações |
| Explorar | `explorar.html` | Catálogo de oportunidades |
| Detalhes | `explorar-detalhe.html` | Informações completas da atividade |
| Criar | `criar-oportunidade.html` | Formulário de criação/edição |
| Perfil | `MeuPerfil.html` | Histórico e retrospectiva anual |
| Impacto | `impacto.html` | Análise de dados globais |
| Testemunhos | `testemunhos.html` | Depoimentos da comunidade |

---

## 🎨 Personalização

### Cores Principais (style.css)

```css
--primary-blue: #007bff;      /* Azul Liferay */
--sidebar-bg: #f4f7fa;        /* Fundo da sidebar */
--card-bg: #fdfdfd;           /* Fundo dos cards */
--text-primary: #333;         /* Texto principal */
--text-secondary: #555;       /* Texto secundário */
```

### Alterar Logo da tela de login

- Substitua a imagem em:
```
images/RISE UP - LIFERAY.jpg
```

---

## 🐛 Troubleshooting

### Erro: `Cannot find module '@prisma/client'`
```bash
npx prisma generate
```

### Erro: `EADDRINUSE` (porta 3000 em uso)
Altere a porta em `server.js`:
```javascript
const PORT = 3001; // ou outra porta disponível
```

### Imagens não aparecem
Verifique se a pasta `uploads/` existe:
```bash
mkdir uploads
```

---

## 🔜 Roadmap (Próximas Funcionalidades)

- [ ] Sistema de notificações por email
- [ ] Integração com calendário (Google Calendar / Outlook)
- [ ] Gamificação com conquistas e badges
- [ ] App mobile (React Native)
- [ ] Sistema de avaliação de atividades (estrelas)
- [ ] Fórum de discussão entre voluntários
- [ ] Integração com redes sociais (compartilhamento)

---

## 📝 Licença

- COPYRIGHT 2025  LIFERAY LATIN AMERICA LTDA
- Todos os direitos reservados.
- Este software é proprietário e não pode ser usado, reproduzido, distribuído ou modificado sem a permissão expressa por escrito do detentor dos direitos autorais.

---

## 🙏 Agradecimentos

- Liferay Latin America LTDA pela inspiração e oportunidade da criação do projeto
- Comunidade open-source pelas ferramentas incríveis
- Todos os participantes que fazem e fizeram a diferença! ❤️

---

<div align="center">
  
**[⬆ Voltar ao topo](#voluntariado-liferay)**

Feito com ❤️ para impactar vidas através do voluntariado


</div>
