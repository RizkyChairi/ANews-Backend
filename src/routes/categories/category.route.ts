import { Router } from "express";
import categoriesController from "../../controllers/categories/categories.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.post('/', authenticate, categoriesController.createCategory);    
router.put('/:id', authenticate, categoriesController.updateCategory);
router.delete('/:id', authenticate, categoriesController.deleteCategory);

export default router;