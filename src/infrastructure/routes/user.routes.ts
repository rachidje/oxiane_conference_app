

import { Router } from "express";
import container from "../config/dependecy-injection";
import { registerUser } from "../controllers/user.controllers";

const router = Router()

router.post('/register', registerUser(container))

export default router;