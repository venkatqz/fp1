import { Router } from 'express';
import { createEarlyAccessUser } from '../controllers/users';

const router = Router();

router.post('/early-access-users', createEarlyAccessUser);

export default router;
