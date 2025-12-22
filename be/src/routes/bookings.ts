import { Router } from 'express';
import * as BookingsController from '../controllers/bookings';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/intent', BookingsController.createBookingIntent);
router.post('/confirm', BookingsController.confirmBooking);
router.put('/:id/cancel', BookingsController.cancelBooking);

export default router;
