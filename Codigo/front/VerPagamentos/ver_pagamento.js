const idProfissional = localStorage.getItem('profissionalId');
const funcaoProfissional = localStorage.getItem('funcao');

const url = funcaoProfissional === 'Psicóloga'
    ? `/api/pagamento/profissional/${idProfissional}`
    : `/api/pagamento`;

function listarPagamentos() {
    var container = document.getElementById('exibir-todos');

    $.ajax({
        url,
        type: 'GET',
        dataType: 'json',
        success: function (pagamentos) {
            pagamentos = Array.isArray(pagamentos) ? pagamentos : [pagamentos];
            
            var tabela = `<table class="todos-table">
                            <thead>
                                <tr>
                                    <th class="th-nome">Nome do Paciente</th>
                                    <th class="th-metodo">Método de Pagamento</th>
                                    <th class="th-data">Data de Pagamento</th>
                                    <th class="th-parcelas">Parcelas</th>
                                    <th class="th-acoes"></th>
                                </tr>
                                <tr>
                                    <td class="td-linha" colspan="5"></td>
                                </tr>
                            </thead>
                            <tbody>
                          `;

            pagamentos.forEach(function (pagamento) {
                tabela += `<tr>
                                <td class="nome-paciente">${pagamento.nome_paciente}</td>
                                <td class="metodo-pagamento">${pagamento.metodo}</td>
                                <td class="data-pagamento">${new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}</td>
                                <td class="parcelas-pagamento">${pagamento.parcelas}</td>
                                <td class="acoes-todos">
                                    <button class="botao-exibir-todos" onclick="editarPagamento(${pagamento.id})"><i class="uil uil-edit-alt"></i></button>
                                </td>
                           </tr>`;
            });

            tabela += `</tbody></table>`;
            container.innerHTML = tabela;
        },
        error: function (xhr, status, error) {
            console.error('Erro ao carregar pagamentos:', error);
        }
    });
}

function editarPagamento(idpagamento) {
    window.location.href = `../EditarPagamento/editar_pagamento.html#${idpagamento}`;
}

$(document).ready(function () {
    listarPagamentos();
});
