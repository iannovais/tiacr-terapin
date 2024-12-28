function listarPacientes() {
    var container = document.getElementById('exibir-todos');

    $.ajax({
        url: '/api/paciente',
        type: 'GET',
        dataType: 'json',
        success: function (pacientes) {
            var tabela = `<table class="todos-table">
                            <thead>
                                <tr>
                                    <th class="th-nome">Nome do Paciente</th>
                                    <th class="th-ans">Sexo</th>
                                    <th class="th-retorno">Telefone</th>
                                    <th class="th-acoes"></th>
                                </tr>
                                <tr>
                                    <td class="td-linha" colspan="5"></td>
                                </tr>
                            </thead>
                            <tbody>
                          `;

            pacientes.forEach(function (paciente) {
                tabela += `<tr>
                                <td class="nome-paciente">${paciente.nome_completo}</td>
                                <td class="sexo-paciente">${paciente.sexo}</td>
                                <td class="telefone-paciente">${paciente.telefone}</td>
                                <td class="acoes-todos">
                                    <button class="botao-exibir-todos" onclick="deletarPaciente(${paciente.id})"><i class="uil uil-trash-alt"></i></button>
                                    <button class="botao-exibir-todos" onclick="verPerfilPaciente(${paciente.id})"><i class="uil uil-user"></i></i></button>
                                </td>
                           </tr>`;
            });

            tabela += `</tbody></table>`;
            container.innerHTML = tabela;
        },
        error: function (xhr, status, error) {
            console.error('Erro ao carregar pacientes:', error);
        }
    });
}

function deletarPaciente(id) {
    $.ajax({
        url: `/api/paciente/${id}`,
        type: 'DELETE',
        success: function (response) {
            listarPacientes();
            Toastify({
                text: "Paciente deletado com sucesso!",
                duration: 3000, 
                gravity: "bottom", 
                position: "right", 
                backgroundColor: "#4CAF50", 
                close: true,
            }).showToast();
            $('#cad-paciente')[0].reset();
        },
        error: function (xhr, status, error) {
            Toastify({
                text: "Erro ao deletar o paciente!",
                duration: 3000,
                gravity: "bottom", 
                position: "right",
                backgroundColor: "#f44336",
                close: true, 
            }).showToast();
        }
    });
}

function verPerfilPaciente(id) {
    window.location.href = `../PerfilPaciente/perfil_paciente.html#${id}`;
}

$(document).ready(function () {
    listarPacientes();

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