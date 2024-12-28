function listarConvenios() {
    var container = document.getElementById('exibir-todos');

    $.ajax({
        url: '/api/convenio',
        type: 'GET',
        dataType: 'json',
        success: function (convenios) {
            var tabela = `<table class="todos-table">
                            <thead>
                                <tr>
                                    <th class="th-nome">Nome do Convênio</th>
                                    <th class="th-ans">ANS</th>
                                    <th class="th-retorno">Limite de Retorno</th>
                                    <th class="th-acoes"></th>
                                </tr>
                                <tr>
                                    <td class="td-linha" colspan="5"></td>
                                </tr>
                            </thead>
                            <tbody>
                          `;

            convenios.forEach(function (convenio) {
                tabela += `<tr>
                                <td class="nome-convenio">${convenio.nome}</td>
                                <td class="ans-convenio">${convenio.ans}</td>
                                <td class="retorno-convenio">${convenio.limite_retorno} dia(s)</td>
                                <td class="acoes-todos">
                                    <button class="botao-exibir-todos" onclick="editarConvenio(${convenio.id})"><i class="uil uil-edit-alt"></i></button>
                                    <button class="botao-exibir-todos" onclick="deletarConvenio(${convenio.id})"><i class="uil uil-trash-alt"></i></button>
                                </td>
                           </tr>`;
            });

            tabela += `</tbody></table>`;
            container.innerHTML = tabela;
        },
        error: function (xhr, status, error) {
            console.error('Erro ao carregar convênios:', error);
        }
    });
}

function deletarConvenio(id) {
    $.ajax({
        url: `/api/convenio/${id}`,
        type: 'DELETE',
        success: function (response) {
            listarConvenios();
            Toastify({
                text: "Convênio deletado com sucesso!",
                duration: 3000, 
                gravity: "bottom", 
                position: "right", 
                backgroundColor: "#4CAF50", 
                close: true,
            }).showToast();

            $('#cad-convenio')[0].reset();
        },
        error: function (xhr, status, error) {
            Toastify({
                text: "Erro ao deletar o convênio!",
                duration: 3000,
                gravity: "bottom", 
                position: "right",
                backgroundColor: "#f44336",
                close: true, 
            }).showToast();
        }
    });
}

function editarConvenio(id) {
    window.location.href = `../EditarConvenio/editar_convenio.html#${id}`;
}

$(document).ready(function () {
    listarConvenios();
});
