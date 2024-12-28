const idPaciente = window.location.hash.substring(1);
console.log(idPaciente);

function openTab(tabName) {
    $('.tab-content').hide();
    $('.tab-button').removeClass('active');
    $(`#${tabName}`).show();
    $(`button[onclick="openTab('${tabName}')"]`).addClass('active');
}

function listarConsultasPorPaciente(idPaciente) {
    var container = document.getElementById('exibir-todos');

    $.ajax({
        url: `/api/consulta/paciente/${idPaciente}`,
        type: 'GET',
        dataType: 'json',
        success: function (consultas) {
            var tabela = `<table class="todos-table">
                <thead>
                    <tr>
                        <th class="th-motivo">Motivo</th>
                        <th class="th-profissional">Profissional</th>
                        <th class="th-data">Data</th>
                        <th class="th-hora">Hora</th>
                        <th class="th-valor">Valor</th>
                        <th class="th-cancelada">Cancelada</th>
                        <th class="th-acoes"></th>
                    </tr>
                </thead>
                <tbody>`;

            consultas.forEach(function (consulta) {
                const dataConsulta = new Date(consulta.data);
                const horaConsulta = consulta.hora.split(':');
                dataConsulta.setHours(horaConsulta[0], horaConsulta[1], 0, 0);

                const dataAtual = new Date();
                const dataFormatada = dataConsulta.toLocaleDateString('pt-BR');
                const horaFormatada = consulta.hora.split(':').slice(0, 2).join(':');
                const canceladaTexto = consulta.cancelada ? 'Sim' : 'Não';
                const valorFormatado = `R$ ${consulta.valor.toFixed(2).replace('.', ',')}`;
                const nomeProfissional = consulta.profissional_nome || 'Nome do Profissional Indefinido';

                let acoes = '';

                if (consulta.cancelada) {
                    acoes = '';
                } else if (dataConsulta > dataAtual) {
                    acoes = `
                        <button class="botao-exibir-todos" onclick="editarConsulta(${consulta.id})"><i class="uil uil-edit-alt"></i></button>
                        <button class="botao-exibir-todos" onclick="deletarConsulta(${consulta.id})"><i class="uil uil-multiply"></i></button>
                        ${consulta.prontuarioId ?
                            `<button class="botao-exibir-todos" onclick="editarProntuario(${consulta.id})"><i class="uil uil-clipboard-alt"></i></button>` :
                            `<button class="botao-exibir-todos" onclick="criarProntuario(${consulta.id})"><i class="uil uil-clipboard-alt"></i></button>`}`;
                } else {
                    acoes = consulta.prontuarioId ?
                        `<button class="botao-exibir-todos" onclick="editarProntuario(${consulta.id})"><i class="uil uil-clipboard-alt"></i></button>` :
                        `<button class="botao-exibir-todos" onclick="criarProntuario(${consulta.id})"><i class="uil uil-clipboard-alt"></i></button>`;
                }

                tabela += `
                    <tr>
                        <td class="motivo-consulta">${consulta.motivo}</td>
                        <td class="profissional-consulta">${nomeProfissional}</td>
                        <td class="data-consulta">${dataFormatada}</td>
                        <td class="hora-consulta">${horaFormatada}</td>
                        <td class="valor-consulta">${valorFormatado}</td>
                        <td class="cancelada-consulta">${canceladaTexto}</td>
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

function deletarConsulta(id) {
    $.ajax({
        url: `/api/consulta/${id}`,
        type: 'DELETE',
        success: function (response) {
            listarConsultasPorPaciente(idPaciente);
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

$(document).ready(function () {
    const inputs = document.querySelectorAll('.input input');
    const container = document.getElementById('informacoes-user');

    function carregarInformacoesInicais(idPaciente) {
        $.ajax({
            url: `/api/paciente/${idPaciente}`,
            type: 'GET',
            dataType: 'json',
            success: function (paciente) {
                container.innerHTML = '';

                var item =
                    `<div class="paciente">
                        <div id="container-informacoes-principais">
                            <div class="img-container">
                                <img src="https://pettec.unifei.edu.br/wp-content/uploads/2023/10/sem-imagem-avatar.png" alt="Imagem do perfil">
                            </div>
                            <div id="informacoes-principais">
                                <h2 class="perfil-nome">${paciente.nome_completo}</h2>
                                <h3 class="perfil-email">${paciente.email}</h3>
                                <h3 class="perfil-cpf">${paciente.cpf}</h3>
                            </div>
                        </div>
                        <div id="informacoes-complementares">
                            <h3 class="perfil-telefone">${paciente.telefone}</h3>
                            <h3 class="perfil-nascimeto">${new Date(paciente.data_nascimento).toLocaleDateString()}</h3>
                        </div>
                    </div>`

                container.innerHTML = item;
            },
            error: function (xhr, status, error) {
                console.error('Erro ao carregar dados do paciente:', error);
            }
        });
    }

    function carregarPaciente(idPaciente) {
        $.ajax({
            type: 'GET',
            url: `/api/paciente/${idPaciente}`,
            dataType: 'json',
            success: function (paciente) {
                const dataNascimentoISO = new Date(paciente.data_nascimento).toISOString().split('T')[0];
                const dataNascimentoFormatada = formatarData(paciente.data_nascimento);
                $('#input-data-nascimento').val(dataNascimentoISO);
                $('#data-nascimento-view').text(dataNascimentoFormatada);
                $('#input-nome-completo').val(paciente.nome_completo);
                $('#input-email').val(paciente.email);
                $('#input-telefone').val(paciente.telefone);
                $('#input-rg').val(paciente.rg);
                $('#input-sexo').val(paciente.sexo);
                $('#input-estado-civil').val(paciente.estado_civil);
                $('#input-cpf').val(paciente.cpf);
                $('#input-cep').val(paciente.cep);
                $('#input-endereco').val(paciente.endereco);
                $('#input-numero').val(paciente.numero);
                $('#input-bairro').val(paciente.bairro);
                $('#input-cidade').val(paciente.cidade);
                $('#input-convenio').val(paciente.convenio);
                $('#input-plano').val(paciente.plano);
                $('#input-numero-carteirinha').val(paciente.numero_carteirinha);
                $('#input-validade').val(paciente.validade ? formatarData(paciente.validade) : '');


                const inputs = document.querySelectorAll('.input input');
                inputs.forEach(input => {
                    if (input.value) {
                        input.classList.add('tem-texto');
                    }
                });
            },
            error: function () {
                showToast("Erro ao carregar os dados do paciente!", "#f44336");
            }
        });
    }

    function formatarData(dataISO) {
        if (!dataISO) return '';
        const date = new Date(dataISO);
        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const dia = String(date.getDate()).padStart(2, '0');
        return `${dia}/${mes}/${ano}`;
    }

    function carregarProntuarios(idPaciente) {
        $.ajax({
            type: 'GET',
            url: `/api/prontuario/prontuarios/${idPaciente}`,
            dataType: 'json',
            success: function (prontuario) {
                $('#prontuario-container').empty();

                if (prontuario.length > 0) {
                    for (var i = 0; i < prontuario.length; i++) {
                        const dataProntuario = formatarData(prontuario[i].data);

                        $('#prontuario-container').append(
                            `<div class="prontuario-item">
                                <p class="data-prontuario">${dataProntuario}</p>
                                <p>${prontuario[i].historico_pessoal}</p>
                            </div>`
                        );
                    }
                } else {
                    $('#prontuario-container').append('<p>Nenhum prontuário encontrado!</p>');
                }
            }
        });
    }

    function carregarConvenios() {
        $.ajax({
            url: '/api/convenio',
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response && response.length > 0) {
                    const $select = $('#input-convenio');
                    response.forEach(convenio => {
                        $select.append(new Option(convenio.nome, convenio.id));
                    });
                } else {
                    console.log('Nenhum convênio encontrado.');
                }
            },
            error: function (error) {
                console.error('Erro ao buscar os convênios:', error);
            }
        });
    }

    $('#cad-paciente').submit(function (e) {
        e.preventDefault();
        const formData = {
            nome_completo: $('#input-nome-completo').val(),
            data_nascimento: $('#input-data-nascimento').val(),
            email: $('#input-email').val(),
            telefone: $('#input-telefone').val(),
            rg: $('#input-rg').val(),
            sexo: $('#input-sexo').val(),
            estado_civil: $('#input-estado-civil').val(),
            cpf: $('#input-cpf').val(),
            cep: $('#input-cep').val(),
            endereco: $('#input-endereco').val(),
            numero: $('#input-numero').val(),
            bairro: $('#input-bairro').val(),
            cidade: $('#input-cidade').val(),
        };

        $.ajax({
            url: `/api/paciente/${idPaciente}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                Toastify({
                    text: "Paciente atualizado com sucesso!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4CAF50",
                    close: true,
                }).showToast();
            },
            error: function (error) {
                console.error('Erro ao atualizar paciente:', error);
                Toastify({
                    text: "Erro ao atualizar paciente!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#FF0000",
                    close: true,
                }).showToast();
            }
        });
    });

    $('#cad-convenio').submit(function (e) {
        e.preventDefault();
        const formData = {
            nome_completo: $('#input-nome-completo').val(),
            data_nascimento: $('#input-data-nascimento').val(),
            email: $('#input-email').val(),
            telefone: $('#input-telefone').val(),
            outro_telefone: $('#input-outro-telefone').val(),
            rg: $('#input-rg').val(),
            sexo: $('#input-sexo').val(),
            estado_civil: $('#input-estado-civil').val(),
            cpf: $('#input-cpf').val(),
            cep: $('#input-cep').val(),
            endereco: $('#input-endereco').val(),
            numero: $('#input-numero').val(),
            bairro: $('#input-bairro').val(),
            cidade: $('#input-cidade').val(),
            convenio: $('#input-convenio').val(),
            plano: $('#input-plano').val(),
            numero_carteirinha: $('#input-numero-carteirinha').val(),
            validade: $('#input-validade').val(),
        };

        $.ajax({
            url: `/api/paciente/${idPaciente}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                Toastify({
                    text: "Paciente atualizado com sucesso!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4CAF50",
                    close: true,
                }).showToast();
            },
            error: function (error) {
                console.error('Erro ao atualizar paciente:', error);
                Toastify({
                    text: "Erro ao atualizar paciente!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#FF0000",
                    close: true,
                }).showToast();
            }
        });
    });

    if (idPaciente) {
        carregarInformacoesInicais(idPaciente);
        carregarPaciente(idPaciente);
        carregarProntuarios(idPaciente);
        listarConsultasPorPaciente(idPaciente);
    }

    carregarConvenios();
    openTab('informacoes-paciente');
});