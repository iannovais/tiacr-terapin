const funcao = localStorage.getItem('funcao');

document.addEventListener('DOMContentLoaded', () => {
    inicializarModoNoturno();

    if (funcao === 'Psicóloga') {
        carregarConteudo('../assets/navbar/navbar.html', 'navbar', () => {
            inicializarNavbar();
            marcarLinkAtivo();
            atualizarNomeUsuario();
            configurarLogout(); 
        });
    } else {
        carregarConteudo('../assets/navbar/navbar_secretaria.html', 'navbar', () => {
            inicializarNavbar();
            marcarLinkAtivo();
            atualizarNomeUsuario();
            configurarLogout(); 
        });
    }

    carregarConteudo('../assets/navbar/topo.html', 'topo');
});

function configurarLogout() {
    const logoutLink = document.querySelector('.menu-link[href="#"]');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            console.log('Clique no logout detectado!');
            deslogar(); 
        });
    }
}

function deslogar() {
    localStorage.removeItem('profissionalId');
    localStorage.removeItem('token');

    window.location.href = 'http://localhost:3000';
}

function marcarLinkAtivo() {
    const links = document.querySelectorAll('.nav-links a');
    const pathAtual = window.location.pathname.split('/').pop();

    links.forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        if (pathAtual === href) {
            link.classList.add('ativa');
        } else {
            link.classList.remove('ativa');
        }
    });
}

function inicializarModoNoturno() {
    const body = document.querySelector("body");
    const getModo = localStorage.getItem("modo");

    if (getModo === "escuro") {
        body.classList.add("escuro");
    }

    const modeToggle = body.querySelector(".alterar-modo");
    if (modeToggle) {
        modeToggle.addEventListener("click", () => {
            body.classList.toggle("escuro");

            const modoAtual = body.classList.contains("escuro") ? "escuro" : "claro";
            localStorage.setItem("modo", modoAtual);
        });
    }
}

function carregarConteudo(url, elementoId, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementoId).innerHTML = data;

            setTimeout(() => {
                if (callback) {
                    callback();
                }
            }, 100);
        })
        .catch(error => console.error('Erro ao carregar o conteúdo:', error));
}

function inicializarNavbar() {
    const body = document.querySelector("body");
    const sidebar = body.querySelector("nav");
    const sidebarToggle = body.querySelector(".sidebar-toggle");
    const abrirMenuBtn = document.querySelector(".container-usuario");
    const menu = document.getElementById("menu-container");

    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            sidebar.classList.toggle("fechada");
        });
    }

    function abrirMenu() {
        menu.classList.toggle("aberto");
    }

    if (abrirMenuBtn) {
        abrirMenuBtn.addEventListener("click", abrirMenu);
    }

    if (menu && abrirMenuBtn) {
        document.addEventListener('click', event => {
            if (!menu.contains(event.target) && !abrirMenuBtn.contains(event.target)) {
                menu.classList.remove("aberto");
            }
        });
    }
}

function atualizarNomeUsuario() {
    const profissionalId = localStorage.getItem('profissionalId');

    if (!profissionalId) {
        console.error('Erro ao buscar o nome do profissional: profissionalId não encontrado');
        return;
    }

    fetch(`/api/auth/profissional/${profissionalId}`)
        .then(response => response.json())
        .then(data => {
            const nomeUsuario = document.getElementById('nome-usuario');
            if (nomeUsuario) {
                nomeUsuario.textContent = data.nome;
            }

            const linkPerfil = document.querySelector('.menu-link-user');
            if (linkPerfil) {
                linkPerfil.setAttribute('href', `../PerfilProfissional/perfil_profissional.html#${profissionalId}`);
            } else {
                console.error('Erro: linkPerfil não encontrado.');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar o nome do profissional:', error);
        });
}
