import express from 'express';
import { getProducts, seedProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import uploadProduct from '../middleware/productUpload.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/seed', seedProducts);
router.post('/', uploadProduct.single('imageFile'), createProduct);
router.put('/:id', uploadProduct.single('imageFile'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
