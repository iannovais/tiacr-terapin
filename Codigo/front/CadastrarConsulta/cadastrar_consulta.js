$(document).ready(function () {
    function carregarPacientes() {
        $.ajax({
            type: 'GET',
            url: '/api/consulta/pacientes',
            success: function (pacientes) {
                var pacienteSelect = $('#input-paciente');
                pacienteSelect.empty();
                pacienteSelect.append('<option value="" disabled selected>Selecione paciente</option>');

                pacientes.forEach(function (paciente) {
                    pacienteSelect.append('<option value="' + paciente.id + '">' + paciente.nome_completo + '</option>');
                });
            },
            error: function (xhr, status, error) {
                console.log('Erro ao carregar pacientes:', error);
            }
        });
    }

    function carregarProfissionais() {
        $.ajax({
            type: 'GET',
            url: '/api/profissional',
            success: function (profissionais) {
                var profissionalSelect = $('#input-profissional');
                profissionalSelect.empty();
                profissionalSelect.append('<option value="" disabled selected>Selecione profissional</option>');

                profissionais.forEach(function (profissional) {
                    profissionalSelect.append('<option value="' + profissional.id_profissional + '">' + profissional.nome + '</option>');
                });
            },
            error: function (xhr, status, error) {
                console.log('Erro ao carregar profissionais:', error);
            }
        });
    }

    function atualizarHorariosDisponiveis() {
        const dataConsulta = $('#input-data').val();
        const idProfissional = $('#input-profissional').val(); 

        if (!dataConsulta || !idProfissional) {
            return;
        }

        $.ajax({
            type: 'GET',
            url: `/api/agenda/disponibilidade/${idProfissional}?data=${dataConsulta}`,
            success: function (response) {
                const selectHorario = $('#select-horario');
                selectHorario.empty();
                selectHorario.append('<option value="">Selecione um horário</option>');

                response.horariosDisponiveis.forEach(function (horario) {
                    selectHorario.append(`<option value="${horario}">${horario}</option>`);
                });
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

    $('#input-data, #input-profissional').on('change', atualizarHorariosDisponiveis);

    carregarPacientes();
    carregarProfissionais();

    $('#input-retorno-switch').on('change', function () {
        const valorInput = $('#input-valor');
        if ($(this).is(':checked')) {
            valorInput.val('');
            valorInput.parent().hide();
        } else {
            valorInput.parent().show();
        }
    });

    $('#marcar-consulta').submit(function (e) {
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

        if (!formData.paciente || !formData.profissional || !formData.data || !formData.hora) {
            Toastify({
                text: "Por favor, preencha todos os campos obrigatórios!",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#f44336",
                close: true,
            }).showToast();
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/api/consulta',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            processData: false,
            success: function (response) {
                Toastify({
                    text: "Consulta marcada com sucesso!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4CAF50",
                    close: true,
                }).showToast();
                $('#marcar-consulta')[0].reset();
                $('#input-valor').parent().show(); 
            },
            error: function (xhr, status, error) {
                console.error("Erro ao marcar consulta:", status, error);
                Toastify({
                    text: "Erro ao marcar consulta.",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#f44336",
                    close: true,
                }).showToast();
            }
        });
    });
});