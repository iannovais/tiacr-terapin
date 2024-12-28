const {db } = require('../config/bdConfig');

function criarProfissional(req, res) {
    const { nome, email, senha, tipo, celular } = req.body;

    if (!nome || !email || !senha || !tipo || !celular) {
        return res.status(400).json({
            error: "É necessário fornecer nome, email, senha, tipo e celular do profissional."
        });
    }

    const q = 'INSERT INTO profissional (nome, email, senha, tipo, celular) VALUES (?, ?, ?, ?, ?)';

    db.query(q, [nome, email, senha, tipo, celular], (error, results) => {
        if (error) {
            console.error('Erro ao registrar profissional:', error);
            return res.status(500).json({ error: 'Erro ao registrar profissional', details: error.message });
        }
        return res.json({ id: results.insertId, nome, email, tipo, celular });
    });
}

function getProfissionais(req, res) {
    const q = 'SELECT * FROM profissional';

    db.query(q, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar profissionais' });
        }
        return res.json(results);
    });
}

function getProfissionalByID(req, res) {
    const id = req.params.id;
    const q = 'SELECT * FROM profissional WHERE id_profissional = ?';

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar profissional por ID' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Profissional não encontrado' });
        }
        return res.json(results[0]);
    });
}

function deletarProfissional(req, res) {
    const id = req.params.id;
    const q = 'DELETE FROM profissional WHERE id_profissional = ?';

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao deletar profissional' });
        }
        if (results.affectedRows > 0) {
            return res.json({ message: 'Profissional deletado com sucesso' });
        }
        return res.status(404).json({ error: "Profissional não encontrado" });
    });
}

function atualizarProfissional(req, res) {
    const { nome, email, senha, tipo, celular } = req.body;
    const id = req.params.id;

    if (!nome && !email && !senha && !tipo && !celular) {
        return res.status(400).json({ error: "É necessário fornecer pelo menos um campo para atualizar." });
    }

    let query = 'UPDATE profissional SET ';
    const fields = [];
    const values = [];

    if (nome) {
        fields.push('nome = ?');
        values.push(nome);
    }
    if (email) {
        fields.push('email = ?');
        values.push(email);
    }
    if (senha) {
        fields.push('senha = ?');
        values.push(senha);
    }
    if (tipo) {
        fields.push('tipo = ?');
        values.push(tipo);
    }
    if (celular) {
        fields.push('celular = ?');
        values.push(celular);
    }

    query += fields.join(', ') + ' WHERE id_profissional = ?';
    values.push(id);

    db.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao atualizar profissional' });
        }
        if (results.affectedRows > 0) {
            return res.json({ id, nome, email, tipo, celular });
        }
        return res.status(404).json({ error: "Profissional não encontrado" });
    });
}

module.exports = {
    criarProfissional,
    getProfissionais,
    getProfissionalByID,
    deletarProfissional,
    atualizarProfissional
};
