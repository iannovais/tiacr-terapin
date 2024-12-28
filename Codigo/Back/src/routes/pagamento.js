const express = require('express');
const router = express.Router();

const PagamentoController = require('../controllers/pagamento');

router.post('/', PagamentoController.criarPagamento);
router.get('/', PagamentoController.getPagamentos);
router.get('/:id', PagamentoController.getPagamentoByID);
router.get('/profissional/:id', PagamentoController.getPagamentoByProfissional);
router.delete('/:id', PagamentoController.deletarPagamento);
router.put('/:id', PagamentoController.atualizarPagamento);

module.exports = router;
