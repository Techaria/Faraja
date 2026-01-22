const express = require('express');
const router = express.Router();
const products = require('../controllers/productsController');
const upload = require('../middlewares/upload');

router.get('/', products.getAll);
router.get('/:id', products.getById);
router.get('/:id/image', products.getImage);
router.post('/', upload.single('image'), products.create);
router.put('/:id', upload.single('image'), products.update);
router.delete('/:id', products.remove);

module.exports = router;