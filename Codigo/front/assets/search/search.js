function search() {
    const searchInput = document.getElementById('searchTodos').value.toLowerCase();
    const TodosItems = document.querySelectorAll('.todos-table tbody tr');

    TodosItems.forEach(item => {
        const camposPesquisa = item.querySelectorAll('td');
        let encontrado = false;

        camposPesquisa.forEach(campo => {
            const textoCampo = campo.innerText.toLowerCase();
            if (textoCampo.includes(searchInput)) {
                encontrado = true;
            }
        });

        const botoesAcoes = item.querySelectorAll('.acoes-todos button');

        if (encontrado) {
            item.style.display = 'table-row';
            botoesAcoes.forEach(button => button.style.display = 'inline-block');
        } else {
            item.style.display = 'none';
            botoesAcoes.forEach(button => button.style.display = 'none');
        }
    });

    if (searchInput === '') {
        TodosItems.forEach(item => {
            item.style.display = 'table-row';
            item.querySelectorAll('.acoes-todos button').forEach(button => button.style.display = 'inline-block');
        });
    }
}
