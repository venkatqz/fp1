import { Router } from 'express';
import * as HotelsController from '../controllers/hotels';
import * as ManagerController from '../controllers/manager';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole as UserRoleEnum } from '../enums';

const router = Router();


router.get('/search', HotelsController.searchAvailableHotels);




router.get('/my-hotels', authenticate, authorize([UserRoleEnum.HOTEL_MANAGER]), ManagerController.getMyHotels);
router.get('/manager/bookings', authenticate, authorize([UserRoleEnum.HOTEL_MANAGER]), ManagerController.getBookings);

router.post('/create', authenticate, authorize([UserRoleEnum.HOTEL_MANAGER]), ManagerController.saveHotel);
router.post('/room-types', authenticate, authorize([UserRoleEnum.HOTEL_MANAGER]), ManagerController.saveRoomType);

router.get('/:id', HotelsController.getHotelById);

router.delete('/:id', authenticate, authorize([UserRoleEnum.HOTEL_MANAGER]), ManagerController.deleteHotel);
router.delete('/room-types/:id', authenticate, authorize([UserRoleEnum.HOTEL_MANAGER]), ManagerController.deleteRoomType);


export default router;
