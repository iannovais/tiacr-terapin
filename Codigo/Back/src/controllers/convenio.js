const {db } = require('../config/bdConfig');

function criarConvenio(req, res) {
    const { nome, ans, limite_retorno } = req.body;

    if (!nome) {
        return res.status(400).json({
            error: "É necessário o nome do convênio"
        });
    }

    const q = 'INSERT INTO convenio (nome, ans, limite_retorno) VALUES (?, ?, ?)';

    db.query(q, [nome, ans, limite_retorno], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao inserir convênio' });
        }
        return res.json({ id: results.insertId, nome, ans, limite_retorno });
    });
}

function getConvenios(req, res) {
    const q = 'SELECT * FROM convenio';

    db.query(q, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar convênios' });
        }
        return res.json(results);
    });
}

function getConvenioByID(req, res) {
    const id = req.params.id;
    const q = 'SELECT * FROM convenio WHERE id = ?';

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar convênios por ID' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Convênio não encontrado' });
        }
        return res.json(results[0]);
    });
}


function deletarConvenio(req, res) {
    const id = req.params.id;
    const q = 'DELETE FROM convenio WHERE id = ?';

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao deletar convênio' });
        }
        if (results.affectedRows > 0) {
            return res.json({ message: 'Convênio deletado com sucesso' });
        }
        return res.status(404).json({
            error: "Convênio não encontrado"
        });
    });
}

function atualizarConvenio(req, res) {
    const { nome, ans, limite_retorno } = req.body;
    const id = req.params.id;
    const q = 'UPDATE convenio SET nome = ?, ans = ?, limite_retorno = ? WHERE id = ?';

    db.query(q, [nome, ans, limite_retorno, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao atualizar convênio' });
        }
        if (results.affectedRows > 0) {
            return res.json({ id, nome, ans, limite_retorno });
        }
        return res.status(404).json({
            error: "Convênio não encontrado"
        });
    });
}

module.exports = {
    criarConvenio,
    getConvenios,
    getConvenioByID,
    deletarConvenio,
    atualizarConvenio
};