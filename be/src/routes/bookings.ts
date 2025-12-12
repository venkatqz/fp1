import { Router } from 'express';
import * as BookingsController from '../controllers/bookings';

const router = Router();

router.post('/intent', BookingsController.createBookingIntent);
router.post('/confirm', BookingsController.confirmBooking);
router.get('/my-bookings', BookingsController.getUserBookings);
router.put('/:id/cancel', BookingsController.cancelBooking);

export default router;
