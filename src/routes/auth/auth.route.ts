import { Router } from "express";
import Authcontroller  from "../../controllers/auth/auth.controllers";
const router = Router();

router.post('/register', Authcontroller.register);
router.post('/login', Authcontroller.login);

export default router;