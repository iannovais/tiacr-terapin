const idProfissional = localStorage.getItem('profissionalId');
const funcaoProfissional = localStorage.getItem('funcao');

const url = funcaoProfissional === 'Psicóloga'
    ? `/api/consulta/profissional/${idProfissional}`
    : `/api/consulta`;

function listarConsultas() {
    var container = document.getElementById('exibir-todos');

    $.ajax({
        url,
        type: 'GET',
        dataType: 'json',
        success: function (consultas) {
            var tabela = `<table class="todos-table">
<thead>
    <tr>
        <th class="th-motivo">Motivo</th>
        <th class="th-paciente">Paciente</th>
        <th class="th-profissional">Profissional </th>
        <th class="th-data">Data / Hora</th>
        <th class="th-valor">Valor</th>
        <th class="th-cancelada">Cancelada</th>
        <th class="th-paga">Paga</th>
        <th class="th-acoes"></th>
    </tr>
    <tr>
        <td class="td-linha" colspan="8"></td>
    </tr>
</thead>

<tbody>
`;

            consultas.forEach(function (consulta) {
                const dataConsulta = new Date(consulta.data);
                const horaConsulta = consulta.hora.split(':');
                dataConsulta.setHours(horaConsulta[0], horaConsulta[1], 0, 0);

                const dataAtual = new Date();
                const dataFormatada = dataConsulta.toLocaleDateString('pt-BR');
                const horaFormatada = consulta.hora.split(':').slice(0, 2).join(':');
                const canceladaTexto = consulta.cancelada ? 'Sim' : 'Não';
                const pagaTexto = consulta.pago ? 'Sim' : 'Não';
                const valorFormatado = `R$ ${consulta.valor.toFixed(2).replace('.', ',')}`;

                let acoes = '';

                if (consulta.cancelada) {
                    acoes = '';
                } else if (dataConsulta > dataAtual) {
                    acoes = `
            <button class="botao-exibir-todos" onclick="editarConsulta(${consulta.id})"><i class="uil uil-edit-alt"></i></button>
            <button class="botao-exibir-todos" onclick="deletarConsulta(${consulta.id})"><i class="uil uil-multiply"></i></button>
            ${consulta.prontuarioId ?
                            `<button class="botao-exibir-todos" onclick="editarProntuario(${consulta.id})"><i class="uil uil-clipboard-alt"></i></button>` :
                            `<button class="botao-exibir-todos" onclick="criarProntuario(${consulta.id})"><i class="uil uil-clipboard-alt"></i></button>`}
        `;
                } else {
                    acoes = `
            ${consulta.prontuarioId ?
                            `<button class="botao-exibir-todos" onclick="editarProntuario(${consulta.id})"><i class="uil uil-clipboard-alt"></i></button>` :
                            `<button class="botao-exibir-todos" onclick="criarProntuario(${consulta.id})"><i class="uil uil-clipboard-alt"></i></button>`}
        `;

                    if (dataConsulta <= dataAtual && !consulta.cancelada && !consulta.retorno) {
                        acoes += consulta.pagamentoId ?
                            `<button class="botao-exibir-todos" onclick="editarPagamento(${consulta.pagamentoId})"><i class="uil uil-dollar-sign"></i></button>` :
                            `<button class="botao-exibir-todos" onclick="cadastrarPagamento(${consulta.id})"><i class="uil uil-dollar-sign"></i></button>`;
                    }
                }

                tabela += `<tr>
        <td class="motivo-consulta">${consulta.motivo}</td>
        <td class="paciente-consulta"><a id="redirecionamento-paciente" href="../PerfilPaciente/perfil_paciente.html#${consulta.paciente}">${consulta.paciente_nome}</td>
        <td class="profissional-consulta">${consulta.profissional_nome}</td>
        <td class="data-consulta">${dataFormatada} - ${horaFormatada}</td>
        <td class="valor-consulta">${valorFormatado}</td>
        <td class="cancelada-consulta">${canceladaTexto}</td>
        <td class="paga-consulta">${pagaTexto}</td>
        <td class="acoes-todos">${acoes}</td>
    </tr>`;
            });


            tabela += `</tbody></table>`;
            container.innerHTML = tabela;
        },
        error: function (xhr, status, error) {
            console.error('Erro ao carregar consultas:', error);
        }
    });
}

function verPerfilPaciente(id) {
    window.location.href = `../PerfilPaciente/perfil_paciente.html#${id}`;
}

function deletarConsulta(id) {
    $.ajax({
        url: `/api/consulta/${id}`,
        type: 'DELETE',
        success: function (response) {
            listarConsultas();
            Toastify({
                text: "Consulta cancelada com sucesso!",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#4CAF50",
                close: true,
            }).showToast();
        },
        error: function (xhr, status, error) {
            Toastify({
                text: "Erro ao cancelar a consulta!",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#f44336",
                close: true,
            }).showToast();
        }
    });
}

function editarConsulta(id) {
    window.location.href = `../EditarConsulta/editar_consulta.html?id=${id}`;
}

function editarProntuario(id) {
    window.location.href = `../EditarProntuario/editar_prontuario.html?id=${id}`;
}

function criarProntuario(id) {
    window.location.href = `../CadastrarProntuario/gerar_prontuario.html?id=${id}`;
}

function cadastrarPagamento(id) {
    window.location.href = `../CadastrarPagamento/cadastrar_pagamento.html?id=${id}`;
}

function editarPagamento(idPagamento) {
    window.location.href = `../EditarPagamento/editar_pagamento.html#${idPagamento}`;
}

$(document).ready(function () {
    listarConsultas();

    const message = localStorage.getItem('toastMessage');
    if (message) {
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#4CAF50"
        }).showToast();

        localStorage.removeItem('toastMessage');
    }
});
