import { Router } from 'express';
import * as HotelsController from '../controllers/hotels';

const router = Router();

router.get('/', HotelsController.getHotels);
router.get('/:id', HotelsController.getHotelById);
router.post('/', HotelsController.createHotel);
router.put('/:id', HotelsController.updateHotel);

export default router;
