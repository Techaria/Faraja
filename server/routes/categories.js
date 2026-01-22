const express = require('express');
const router = express.Router();
const categories = require('../controllers/categoriesController');

router.get('/', categories.getAll);
router.post('/', categories.create);
router.put('/:id', categories.update);
router.delete('/:id', categories.remove);

module.exports = router;