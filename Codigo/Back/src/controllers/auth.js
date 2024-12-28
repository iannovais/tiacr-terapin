const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/bdConfig'); 

exports.registerProfissional = (req, res) => {
    const { nome, email, senha, tipo, celular } = req.body;

    if (!nome || !email || !senha || !tipo || !celular) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    db.query('SELECT * FROM profissional WHERE email = ?', [email], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erro no banco de dados.' });
        if (results.length > 0) return res.status(400).json({ message: 'Profissional já registrado.' });

        bcrypt.hash(senha, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: 'Erro ao criptografar a senha.' });

            const query = 'INSERT INTO profissional (nome, email, senha, tipo, celular) VALUES (?, ?, ?, ?, ?, ?)';
            const values = [nome, email, hash, tipo, celular, tipo];

            db.query(query, values, (error, result) => {
                if (error) return res.status(500).json({ error: 'Erro ao registrar profissional.' });
                return res.status(201).json({ message: 'Profissional registrado com sucesso.' });
            });
        });
    });
};

exports.loginProfissional = (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    }

    db.query('SELECT * FROM profissional WHERE email = ?', [email], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erro no banco de dados.' });
        if (results.length === 0) return res.status(401).json({ message: 'Profissional não encontrado.' });

        const profissional = results[0];

        if (senha !== profissional.senha) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        const token = jwt.sign(
            { id: profissional.id_profissional, tipo: profissional.tipo },
            'secreto_do_token');
        return res.status(200).json({ 
            message: 'Login bem-sucedido', 
            token,
            id: profissional.id_profissional,
            tipo: profissional.tipo
        });
    });
};

exports.getProfissionalById = (req, res) => {
    const profissionalId = req.params.id;

    db.query('SELECT nome FROM profissional WHERE id_profissional = ?', [profissionalId], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erro no banco de dados.' });
        if (results.length === 0) return res.status(404).json({ message: 'Profissional não encontrado.' });

        return res.status(200).json(results[0]);
    });
};