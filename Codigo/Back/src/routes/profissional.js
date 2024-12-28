const express = require('express');
const router = express.Router();

const ProfissionalController = require('../controllers/profissional');

router.post('/', ProfissionalController.criarProfissional);
router.get('/', ProfissionalController.getProfissionais);
router.get('/:id', ProfissionalController.getProfissionalByID);
router.delete('/:id', ProfissionalController.deletarProfissional);
router.put('/:id', ProfissionalController.atualizarProfissional);

module.exports = router;
