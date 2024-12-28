const idProfissional = window.location.hash.substring(1);

$(document).ready(function () {
    const container = document.getElementById('informacoes-user');

    $.ajax({
        url: `/api/profissional/${idProfissional}`,
        type: 'GET',
        dataType: 'json',
        success: function (profissional) {
            container.innerHTML = '';

            var item =
                `<div class="paciente">
                        <div id="container-informacoes-principais">
                            <div class="img-container">
                                <img src="https://pettec.unifei.edu.br/wp-content/uploads/2023/10/sem-imagem-avatar.png" alt="Imagem do perfil">
                            </div>
                            <div id="informacoes-principais">
                                <h2 class="perfil-nome">${profissional.nome}</h2>
                                <h3 class="perfil-email">${profissional.email}</h3>
                                <h3 class="perfil-telefone">${profissional.celular}</h3>
                            </div>
                        </div>
                        <div id="informacoes-complementares">
                            <h3 class="perfil-telefone">${profissional.tipo}</h3>
                            <h3 class="perfil-telefone">‎ </h3>
                        </div>
                    </div>`

            container.innerHTML = item;
        },
        error: function (xhr, status, error) {
            console.error('Erro ao carregar dados do paciente:', error);
        }
    });
});