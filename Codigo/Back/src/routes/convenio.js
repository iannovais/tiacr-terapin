const express = require('express');
const router = express.Router();

const ConvenioController = require('../controllers/convenio');

router.post('/', ConvenioController.criarConvenio);
router.get('/', ConvenioController.getConvenios);
router.get('/:id', ConvenioController.getConvenioByID);
router.delete('/:id', ConvenioController.deletarConvenio);
router.put('/:id', ConvenioController.atualizarConvenio);

module.exports = router;