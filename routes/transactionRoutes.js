const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/', transactionController.createTransaction); // Manual creation if needed
router.get('/', transactionController.getAllTransactions); // Admin use mostly
router.get('/user', transactionController.getUserTransactions);
router.get('/:id', transactionController.getTransactionById);

module.exports = router;
