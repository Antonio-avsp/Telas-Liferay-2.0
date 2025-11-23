/**
 * ============================================================================
 * ARQUIVO: app.js
 * PROJETO: Voluntariado Liferay
 * DESCRIÇÃO: Script global de controle do Front-end.
 * * RESPONSABILIDADES:
 * 1. Segurança: Impede acesso a páginas internas sem login.
 * 2. Identidade: Atualiza a barra lateral (Sidebar) com nome e avatar do usuário.
 * 3. Dados em Tempo Real: Busca o total de horas atualizado no servidor.
 * 4. Sessão: Gerencia a funcionalidade de Logout (Sair).
 * * ESTE ARQUIVO DEVE SER IMPORTADO EM TODAS AS PÁGINAS HTML.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async function() {
    
    // ========================================================================
    // 1. VERIFICAÇÃO DE SEGURANÇA (AUTENTICAÇÃO)
    // ========================================================================
    
    // Recupera os dados do usuário salvos no navegador (persistência de sessão)
    const userJson = localStorage.getItem('userData');
    
    // Verifica em qual página o usuário está atualmente
    const isLoginPage = window.location.pathname.includes('login.html');
    
    // LÓGICA DE PROTEÇÃO DE ROTA:
    // Se NÃO tem usuário salvo E NÃO está na página de login...
    if (!userJson && !isLoginPage) {
        alert('Você precisa fazer login para acessar esta página.');
        // ...Redireciona forçadamente para o login.
        window.location.href = 'login.html';
        return; // Interrompe a execução do restante do script
    }

    // ========================================================================
    // 2. ATUALIZAÇÃO DA INTERFACE (SIDEBAR)
    // ========================================================================
    
    // Se o usuário estiver logado, atualizamos os elementos visuais da barra lateral
    if (userJson) {
        // Converte a string JSON de volta para Objeto JavaScript
        const user = JSON.parse(userJson);
        
        // Seleciona os elementos do DOM na Sidebar
        const sidebarNome = document.querySelector('.user-details strong');
        const sidebarAvatar = document.querySelector('.avatar-small');
        const sidebarHoras = document.getElementById('sidebar-horas'); 
        
        // A. DADOS ESTÁTICOS (Vêm do LocalStorage - Rápido)
        // Atualiza o Nome
        if (sidebarNome) {
            sidebarNome.textContent = user.nome;
        }

        // Atualiza o Avatar (Pega a primeira letra do nome e coloca em maiúsculo)
        if (sidebarAvatar) {
            sidebarAvatar.textContent = user.nome.charAt(0).toUpperCase();
        }

        // B. DADOS DINÂMICOS (Vêm do Servidor - Sempre atualizado)
        // As horas mudam conforme o usuário participa de atividades, então
        // não confiamos no LocalStorage para isso. Buscamos na API.
        if (sidebarHoras) {
            try {
                // Faz requisição GET para a rota de estatísticas
                const response = await fetch(`/api/estatisticas/${user.cpf}`);
                
                if (response.ok) {
                    const dados = await response.json();
                    // Atualiza o texto com o valor real vindo do banco de dados
                    sidebarHoras.textContent = `${dados.minhasHoras}h de voluntariado`;
                }
            } catch (error) {
                // Em caso de erro (ex: servidor offline), loga no console mas não trava a página
                console.error("Erro ao atualizar horas da sidebar:", error);
            }
        }
    }

    // ========================================================================
    // 3. FUNCIONALIDADE DE LOGOUT (ENCERRAR SESSÃO)
    // ========================================================================
    
    const logoutButton = document.querySelector('.logout-button');

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // 1. Limpa os dados de sessão do navegador
            localStorage.removeItem('userLoggedIn'); // Flag de controle (se houver)
            localStorage.removeItem('userData');     // Dados do usuário (CPF, Nome, Email)
            
            // 2. Feedback visual
            alert('Você saiu do sistema.');
            
            // 3. Redireciona para a tela de entrada
            window.location.href = 'login.html';
        });
    }
});