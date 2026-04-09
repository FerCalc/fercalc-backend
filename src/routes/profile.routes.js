// src/routes/profile.routes.js

import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { getProfileInfo, changeUsername, changePassword, deleteAccount } from '../controllers/profile.controller.js';

const router = Router();

// Todas requieren autenticación
router.use(authRequired);

router.get('/',                 getProfileInfo);
router.put('/username',         changeUsername);
router.put('/password',         changePassword);
router.delete('/delete-account', deleteAccount);

export default router;
