const {db } = require('../config/bdConfig');

function criarPaciente(req, res) {
    const { nome_completo, data_nascimento, email, telefone, outro_telefone, rg, sexo, estado_civil, cpf, cep, endereco, numero, bairro, cidade, convenio, plano, numero_carteirinha, validade } = req.body;

    if (!nome_completo|| !data_nascimento || !email || !telefone || !rg || !sexo || !estado_civil || !cpf || !cep || !endereco || !numero || !bairro || !cidade) {
        return res.status(400).json({
            error: "É necessário fornecer outras informações"
        });
    }

    const q = 'INSERT INTO paciente ( nome_completo, data_nascimento, email, telefone, outro_telefone, rg, sexo, estado_civil, cpf, cep, endereco, numero, bairro, cidade, convenio, plano, numero_carteirinha, validade ) VALUES (?, ?, ?, ?, ?, ?,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,?)';

    db.query(q, [nome_completo, data_nascimento, email, telefone, outro_telefone, rg, sexo, estado_civil, cpf, cep, endereco, numero, bairro, cidade, convenio, plano, numero_carteirinha, validade ], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao inserir paciente' });
        }
        return res.json({ id: results.insertId, nome_completo, data_nascimento, email, telefone, outro_telefone, rg, sexo, estado_civil, cpf, cep, endereco, numero, bairro, cidade, convenio, plano, numero_carteirinha, validade  });
    });
}

function getPacientes(req, res) {
    const q = 'SELECT * FROM paciente';

    db.query(q, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar paciente' });
        }
        return res.json(results);
    });
}

function getPacienteByID(req, res) {
    const id = req.params.id;
    const q = 'SELECT * FROM paciente WHERE id = ?';

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar paciente por ID' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Paciente não encontrada' });
        }
        return res.json(results[0]);
    });
}

function deletarPaciente(req, res) {
    const id = req.params.id;
    const q = 'DELETE FROM paciente WHERE id = ?';

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao deletar paciente' });
        }
        if (results.affectedRows > 0) {
            return res.json({ message: 'Paciente deletada com sucesso' });
        }
        return res.status(404).json({
            error: "Paciente não encontrada"
        });
    });
}

function atualizarPaciente(req, res) {
    const { nome_completo, data_nascimento, email, telefone, outro_telefone, rg, sexo, estado_civil, cpf, cep, endereco, numero, bairro, cidade, convenio, plano, numero_carteirinha, validade  } = req.body;
    const id = req.params.id;
    const q = 'UPDATE paciente SET nome_completo = ?, data_nascimento = ?, email = ?, telefone = ?, outro_telefone = ?, rg = ?, sexo = ?, estado_civil = ?, cpf = ?, cep = ?, endereco = ?, numero = ?, bairro = ?, cidade = ?, convenio = ?, plano = ?, numero_carteirinha = ?, validade = ? WHERE id = ?';

    db.query(q, [nome_completo, data_nascimento, email, telefone, outro_telefone, rg, sexo, estado_civil, cpf, cep, endereco, numero, bairro, cidade, convenio, plano, numero_carteirinha, validade , id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao atualizar paciente' });
        }
        if (results.affectedRows > 0) {
            return res.json({ id, nome_completo, data_nascimento, email, telefone, outro_telefone, rg, sexo, estado_civil, cpf, cep, endereco, numero, bairro, cidade, convenio, plano, numero_carteirinha, validade  });
        }
        return res.status(404).json({
            error: "Paciente não encontrada"
        });
    });
}

module.exports = {
    criarPaciente,
    getPacientes,
    getPacienteByID,
    deletarPaciente,
    atualizarPaciente
};
