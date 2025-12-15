import { Router } from 'express';
import * as HotelsController from '../controllers/hotels';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', HotelsController.getHotels);
router.get('/search', HotelsController.searchAvailableHotels);
router.get('/:id', HotelsController.getHotelById);
router.post('/', authenticate, HotelsController.createHotel);
router.put('/:id', authenticate, HotelsController.updateHotel);

export default router;
