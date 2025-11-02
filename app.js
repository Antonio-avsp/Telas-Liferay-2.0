// Este script vai rodar em TODAS as páginas internas (Início, Explorar, Perfil, etc.)

if (!localStorage.getItem('userLoggedIn')) {
    
    // Se não existe (usuário não logou), redireciona para a página de login
    alert('Você precisa fazer login para acessar esta página.');
    window.location.href = 'login.html';
}


// --- 2. LÓGICA DE LOGOUT ---

document.addEventListener('DOMContentLoaded', function() {
    

    const logoutButton = document.querySelector('.logout-button');

    
    if (logoutButton) {
        
       
        logoutButton.addEventListener('click', function() {
            
            
            localStorage.removeItem('userLoggedIn');
            
            
            alert('Você foi desconectado.');
            window.location.href = 'login.html';
        });
    }
});