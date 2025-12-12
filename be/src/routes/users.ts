import { Router } from 'express';
import * as UsersController from '../controllers/users';

const router = Router();

router.post('/early-access-users', UsersController.createEarlyAccessUser);

export default router;
