import { Request, Response } from 'express';
import { ApiResponse } from '../apicontract';
import { ManagerService } from '../services/manager.service';

export const getMyHotels = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ status: false, statusCode: 401, message: 'User not authenticated' });
        }

        const result = await ManagerService.getHotelsByManager(user.userId);

        const response: ApiResponse = {
            status: true,
            statusCode: 200,
            message: 'My hotels retrieved',
            data: result
        };

        res.json(response);
    } catch (error) {
        console.error('Get my hotels error:', error);
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
    }
};
export const getBookings = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ status: false, statusCode: 401, message: 'User not authenticated' });
        }

        const result = await ManagerService.getBookingsByManager(user.userId);

        const response: ApiResponse = {
            status: true,
            statusCode: 200,
            message: 'My bookings retrieved',
            data: result
        };

        res.json(response);
    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
    }
};

export const saveHotel = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ status: false, statusCode: 401, message: 'User not authenticated' });
        }

        const { id } = req.body;
        let result;
        let statusCode = 200;
        let message = '';

        if (id) {
            // Update
            result = await ManagerService.updateHotel(user.userId, id, req.body);
            message = 'Hotel updated successfully';
        } else {
            // Create
            result = await ManagerService.createHotel(user.userId, req.body);
            statusCode = 201;
            message = 'Hotel created successfully';
        }

        const response: ApiResponse = {
            status: true,
            statusCode,
            message,
            data: result
        };

        res.status(statusCode).json(response);
    } catch (error: any) {
        console.error('Save hotel error:', error);
        res.status(500).json({ status: false, statusCode: 500, message: error.message || 'Internal server error' });
    }
};

export const deleteHotel = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ status: false, statusCode: 401, message: 'User not authenticated' });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: false, statusCode: 400, message: 'Hotel ID is required' });
        }

        await ManagerService.deleteHotel(user.userId, id);

        res.status(200).json({ status: true, statusCode: 200, message: 'Hotel deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ status: false, statusCode: 500, message: error.message || 'Error deleting hotel' });
    }
};

export const saveRoomType = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ status: false, statusCode: 401, message: 'User not authenticated' });
        }

        const { id } = req.body;
        let result;
        let statusCode = 200;
        let message = '';

        if (id) {
            // Update
            result = await ManagerService.updateRoomType(user.userId, id, req.body);
            message = 'Room Type updated successfully';
        } else {
            // Create
            result = await ManagerService.createRoomType(user.userId, req.body);
            statusCode = 201;
            message = 'Room Type created successfully';
        }

        const response: ApiResponse = {
            status: true,
            statusCode,
            message,
            data: result
        };

        res.status(statusCode).json(response);
    } catch (error: any) {
        console.error('Save room type error:', error);
        if (error.message.includes('Unauthorized') || error.message.includes('access denied')) {
            return res.status(403).json({ status: false, statusCode: 403, message: error.message });
        }
        res.status(500).json({ status: false, statusCode: 500, message: error.message || 'Internal server error' });
    }
};

export const deleteRoomType = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ status: false, statusCode: 401, message: 'User not authenticated' });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: false, statusCode: 400, message: 'Room Type ID is required' });
        }

        await ManagerService.deleteRoomType(user.userId, id);

        res.status(200).json({ status: true, statusCode: 200, message: 'Room type deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ status: false, statusCode: 500, message: error.message || 'Error deleting room type' });
    }
};

