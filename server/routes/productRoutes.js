import express from 'express';
import {
  getProducts,
  getProduct,
  getAnalytics,
  getRecommendations,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilterOptions
} from '../controllers/productController.js';

const router = express.Router();

router.get('/analytics/stats', getAnalytics);
router.get('/filters/options', getFilterOptions);
router.get('/recommendations', getRecommendations);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
