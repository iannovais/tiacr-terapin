$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const consultaId = urlParams.get('id');
    let consultaCarregada = false; 
    let consultaInicialCarregada = false; 
    let horarioAtual = null; 
    const inputs = document.querySelectorAll('.input input');

    function atualizarHorariosDisponiveisParaEdicao(dataConsulta, idProfissional, consultaId, limparHorario = false) {
        if (!dataConsulta || !idProfissional) {
            return;
        }

        $.ajax({
            type: 'GET',
            url: `/api/agenda/disponibilidade-edicao/${idProfissional}?data=${dataConsulta}&consultaId=${consultaId}`,
            success: function (response) {
                const selectHorario = $('#select-horario');
                selectHorario.empty();
                selectHorario.append('<option value="">Selecione um horário</option>');

                response.horariosDisponiveis.forEach(function (horario) {
                    selectHorario.append(`<option value="${horario}">${horario}</option>`);
                });

                if (!limparHorario && horarioAtual) {
                    setTimeout(function () {
                        selectHorario.val(horarioAtual);
                    }, 100);
                }

                verificarCamposPreenchidos();
            },
            error: function (xhr, status, error) {
                console.error("Erro ao buscar horários disponíveis:", status, error);
                Toastify({
                    text: "Erro ao buscar horários disponíveis.",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#f44336",
                    close: true,
                }).showToast();
            }
        });
    }

    function carregarProfissionais(profissionalId) {
        $.ajax({
            type: 'GET',
            url: '/api/profissional',
            success: function (profissionais) {
                var profissionalSelect = $('#input-profissional');
                profissionalSelect.empty();
                profissionalSelect.append('<option value="" disabled>Selecione o profissional</option>');

                profissionais.forEach(function (profissional) {
                    const isSelected = profissional.id_profissional == profissionalId ? 'selected' : '';
                    profissionalSelect.append('<option value="' + profissional.id_profissional + '" ' + isSelected + '>' + profissional.nome + '</option>');
                });

                profissionalSelect.val(profissionalId).change();
            },
            error: function (xhr, status, error) {
                console.log('Erro ao carregar profissionais:', error);
            }
        });
    }

    function carregarPacientes(pacienteId) {
        $.ajax({
            type: 'GET',
            url: '/api/consulta/pacientes',
            success: function (pacientes) {
                var pacienteSelect = $('#input-paciente');
                pacienteSelect.empty();
                pacienteSelect.append('<option value="" disabled>Selecione o paciente</option>');

                pacientes.forEach(function (paciente) {
                    const isSelected = paciente.id == pacienteId ? 'selected' : '';
                    pacienteSelect.append('<option value="' + paciente.id + '" ' + isSelected + '>' + paciente.nome_completo + '</option>');
                });

                pacienteSelect.val(pacienteId).change();
            },
            error: function (xhr, status, error) {
                console.log('Erro ao carregar pacientes:', error);
            }
        });
    }

    function formatarData(dataISO) {
        const data = new Date(dataISO);
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }

    function verificarCamposPreenchidos() {
        inputs.forEach(input => {
            if (input.value) {
                input.classList.add('tem-texto');
            }
        });

        const textareaMotivo = $('#input-motivo');
        const inputProfissional = $('#input-profissional');

        if (textareaMotivo.val()) {
            textareaMotivo.addClass('tem-texto');
        }

        if (inputProfissional.val()) {
            inputProfissional.addClass('tem-texto');
        }
    }

    function carregarConsulta() {
        $.ajax({
            type: 'GET',
            url: '/api/consulta/' + consultaId,
            success: function (consulta) {
                $('#input-motivo').val(consulta.motivo);
                $('#input-data').val(formatarData(consulta.data));

                horarioAtual = consulta.hora.substring(0, 5);

                $('#input-retorno-switch').prop('checked', consulta.retorno === 1);
                $('#input-valor').val(consulta.valor.toFixed(2)); 

                carregarPacientes(consulta.paciente);
                carregarProfissionais(consulta.profissional);

                atualizarHorariosDisponiveisParaEdicao(consulta.data, consulta.profissional, consulta.id);

                consultaCarregada = true; 
                consultaInicialCarregada = true; 
            },
            error: function (xhr, status, error) {
                console.log('Erro ao carregar consulta:', error);
            }
        });
    }

    $('#input-data, #input-profissional').on('change', function () {
        if (consultaCarregada && consultaInicialCarregada) {
            const dataConsulta = $('#input-data').val();
            const idProfissional = $('#input-profissional').val();

            $('#select-horario').val('');
            $('#select-horario').empty();

            $('#select-horario').append('<option value="">Selecione um horário</option>');

            atualizarHorariosDisponiveisParaEdicao(dataConsulta, idProfissional, consultaId, true);
        }
    });

    $('#input-retorno-switch').on('change', function () {
        const valorInput = $('#input-valor');
        if ($(this).is(':checked')) {
            valorInput.val(''); 
            valorInput.parent().hide(); 
        } else {
            valorInput.parent().show(); 
        }
    });

    $('#editar-consulta').submit(function (e) {
        e.preventDefault();

        var formData = {
            motivo: $('#input-motivo').val(),
            paciente: $('#input-paciente').val(),
            profissional: $('#input-profissional').val(),
            data: $('#input-data').val(),
            hora: $('#select-horario').val(),
            retorno: $('#input-retorno-switch').is(':checked') ? 1 : 0,
            valor: $('#input-valor').val() ? parseFloat($('#input-valor').val()) : 0 
        };

        $.ajax({
            type: 'PUT',
            url: '/api/consulta/' + consultaId,
            data: JSON.stringify(formData),
            contentType: 'application/json',
            processData: false,
            success: function (response) {
                Toastify({
                    text: "Consulta atualizada com sucesso!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4CAF50",
                    close: true,
                }).showToast();
            },
            error: function (xhr, status, error) {
                Toastify({
                    text: "Erro ao atualizar a consulta!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#f44336",
                    close: true,
                }).showToast();
            }
        });
    });

    carregarConsulta();
});