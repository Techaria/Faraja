const express = require('express');
const router = express.Router();
const orders = require('../controllers/ordersController');

router.get('/', orders.getAll);
router.post('/', orders.create);
router.post('/checkout', orders.checkout);

module.exports = router;