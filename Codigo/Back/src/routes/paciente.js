const express = require('express');
const router = express.Router();

const PacienteController = require('../controllers/paciente');

router.post('/', PacienteController.criarPaciente);
router.get('/', PacienteController.getPacientes);
router.get('/:id', PacienteController.getPacienteByID);
router.delete('/:id', PacienteController.deletarPaciente);
router.put('/:id', PacienteController.atualizarPaciente);

module.exports = router;
