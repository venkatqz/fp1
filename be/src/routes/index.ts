import { Router } from 'express';
import hotelRoutes from './hotels';
import authRoutes from './auth';
import bookingRoutes from './bookings';
import userRoutes from './users';

const router = Router();

router.use('/hotels', hotelRoutes);
router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/', userRoutes);

export default router;
