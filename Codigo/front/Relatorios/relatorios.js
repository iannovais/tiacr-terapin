function abrirTab(tabName) {
    $('.tab-content').hide();
    $('.tab-button').removeClass('active');
    $(`#${tabName}`).show();
    $(`button[onclick="abrirTab('${tabName}')"]`).addClass('active');
}

function carregarProfissionais() {
    $.ajax({
        type: 'GET',
        url: '/api/profissional',
        success: function (profissionais) {
            var profissionalSelect = $('.input-profissional');
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

function carregarPacientes() {
    $.ajax({
        type: 'GET',
        url: '/api/paciente',
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

$(document).ready(function () {
    carregarPacientes();
    carregarProfissionais(); 
    abrirTab('paciente');
});
