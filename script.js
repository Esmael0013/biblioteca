document.getElementById('emprestimoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value;
    const nomeLivro = document.getElementById('nomeLivro').value;
    const numeroLivro = document.getElementById('numeroLivro').value;
    const observacao = document.getElementById('observacao').value;

    const emprestimo = { nome, nomeLivro, numeroLivro, observacao };
    addEmprestimo(emprestimo);
    saveToLocalStorage();
    this.reset();
});

document.getElementById('livroForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const nomeLivro = document.getElementById('nomeLivroGerenciar').value;
    const numeroLivros = document.getElementById('numeroLivros').value;
    const observacao = document.getElementById('observacaoLivro').value;

    const livro = { nomeLivro, numeroLivros, observacao };
    addOrUpdateLivro(livro);
    saveToLocalStorage();
    this.reset();
});

document.getElementById('searchEmprestimo').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll('#emprestimosTable tbody tr');
    rows.forEach(row => {
        const nome = row.querySelector('td').textContent.toLowerCase();
        row.style.display = nome.includes(searchTerm) ? '' : 'none';
    });
});

document.getElementById('searchLivro').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll('#livrosTable tbody tr');
    rows.forEach(row => {
        const nomeLivro = row.querySelector('td').textContent.toLowerCase();
        row.style.display = nomeLivro.includes(searchTerm) ? '' : 'none';
    });
});

function addEmprestimo(emprestimo) {
    const table = document.querySelector('#emprestimosTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${emprestimo.nome}</td>
        <td>${emprestimo.nomeLivro}</td>
        <td>${emprestimo.numeroLivro}</td>
        <td>${emprestimo.observacao}</td>
        <td><button onclick="devolverLivro(this)">Devolver</button></td>
    `;
    table.appendChild(row);
}

function devolverLivro(button) {
    const row = button.parentElement.parentElement;
    const emprestimo = {
        nome: row.children[0].textContent,
        nomeLivro: row.children[1].textContent,
        numeroLivro: row.children[2].textContent,
        observacao: row.children[3].textContent
    };
    addToHistorico(emprestimo);
    row.remove();
    saveToLocalStorage();
}

function addToHistorico(emprestimo) {
    const table = document.querySelector('#historicoTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${emprestimo.nome}</td>
        <td>${emprestimo.nomeLivro}</td>
        <td>${emprestimo.numeroLivro}</td>
        <td>${emprestimo.observacao}</td>
        <td><button onclick="removerHistorico(this)">Remover</button></td>
    `;
    table.appendChild(row);
}

function removerHistorico(button) {
    button.parentElement.parentElement.remove();
    saveToLocalStorage();
}

function addOrUpdateLivro(livro) {
    const table = document.querySelector('#livrosTable tbody');
    let row = Array.from(table.rows).find(r => r.cells[0].textContent === livro.nomeLivro);
    if (row) {
        row.cells[1].textContent = livro.numeroLivros;
        row.cells[2].textContent = livro.observacao;
    } else {
        row = document.createElement('tr');
        row.innerHTML = `
            <td>${livro.nomeLivro}</td>
            <td>${livro.numeroLivros}</td>
            <td>${livro.observacao}</td>
            <td>
                <button onclick="editarLivro(this)">Editar</button>
                <button onclick="removerLivro(this)">Remover</button>
            </td>
        `;
        table.appendChild(row);
    }
}

function editarLivro(button) {
    const row = button.parentElement.parentElement;
    document.getElementById('nomeLivroGerenciar').value = row.cells[0].textContent;
    document.getElementById('numeroLivros').value = row.cells[1].textContent;
    document.getElementById('observacaoLivro').value = row.cells[2].textContent;
}

function removerLivro(button) {
    button.parentElement.parentElement.remove();
    saveToLocalStorage();
}

function saveToLocalStorage() {
    const emprestimos = [];
    document.querySelectorAll('#emprestimosTable tbody tr').forEach(row => {
        emprestimos.push({
            nome: row.children[0].textContent,
            nomeLivro: row.children[1].textContent,
            numeroLivro: row.children[2].textContent,
            observacao: row.children[3].textContent
        });
    });
    const historico = [];
    document.querySelectorAll('#historicoTable tbody tr').forEach(row => {
        historico.push({
            nome: row.children[0].textContent,
            nomeLivro: row.children[1].textContent,
            numeroLivro: row.children[2].textContent,
            observacao: row.children[3].textContent
        });
    });
    const livros = [];
    document.querySelectorAll('#livrosTable tbody tr').forEach(row => {
        livros.push({
            nomeLivro: row.children[0].textContent,
            numeroLivros: row.children[1].textContent,
            observacao: row.children[2].textContent
        });
    });
    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    localStorage.setItem('historico', JSON.stringify(historico));
    localStorage.setItem('livros', JSON.stringify(livros));
}

function loadFromLocalStorage() {
    const emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];
    emprestimos.forEach(addEmprestimo);
    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    historico.forEach(addToHistorico);
    const livros = JSON.parse(localStorage.getItem('livros')) || [];
    livros.forEach(addOrUpdateLivro);
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = tab.id === tabId ? '' : 'none';
    });
}

function exportarJSON() {
    const data = {
        emprestimos: JSON.parse(localStorage.getItem('emprestimos')) || [],
        historico: JSON.parse(localStorage.getItem('historico')) || [],
        livros: JSON.parse(localStorage.getItem('livros')) || []
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "biblioteca_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importarJSON() {
    const fileInput = document.getElementById('importarJSON');
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = JSON.parse(event.target.result);
        const emprestimos = data.emprestimos || [];
        const historico = data.historico || [];
        const livros = data.livros || [];

        emprestimos.forEach(addEmprestimo);
        historico.forEach(addToHistorico);
        livros.forEach(addOrUpdateLivro);

        saveToLocalStorage();
    };
    reader.readAsText(file);
}

loadFromLocalStorage();
