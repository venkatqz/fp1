import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { ApiResponse } from '../apicontract';

export const createBookingIntent = async (req: Request, res: Response) => {
    try {
        console.log('[Bookings] Received Intent Request:', req.body);

        // Inject userId from authenticated user
        const userId = (req as any).user?.userId;

        const result = await BookingService.createIntent({
            ...req.body,
            userId // Pass userId to service
        });

        const response: ApiResponse = {
            status: true,
            statusCode: 200,
            message: 'Payment intent created',
            data: result
        };

        res.json(response);
    } catch (error: any) {
        if (error.message === 'Missing required fields' || error.message.includes('Room capacity exceeded') || error.message.includes('Room not available') || error.message.includes('Check-out date')) {
            return res.status(400).json({ status: false, statusCode: 400, message: error.message });
        }
        res.status(500).json({ status: false, statusCode: 500, message: error.message || 'Internal server error' });
    }
};

export const confirmBooking = async (req: Request, res: Response) => {
    try {
        const result = await BookingService.confirmBooking(req.body);

        const response: ApiResponse = {
            status: true,
            statusCode: 201,
            message: 'Booking confirmed successfully',
            data: result
        };

        res.status(201).json(response);
    } catch (error: any) {
        if (error.message === 'Missing payment intent ID') {
            return res.status(400).json({ status: false, statusCode: 400, message: error.message });
        }
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: false, statusCode: 400, message: 'Booking ID is required' });
        }
        const result = await BookingService.cancelBooking(id);

        res.json({
            status: true,
            statusCode: 200,
            message: 'Booking cancelled successfully',
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ status: false, statusCode: 500, message: error.message || 'Error cancelling booking' });
    }
};

export const getUserBookings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Unauthorized'
            });
        }

        const bookings = await BookingService.getUserBookings(userId);

        res.json({
            status: true,
            statusCode: 200,
            message: 'Bookings retrieved successfully',
            data: bookings
        });
    } catch (error: any) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message || 'Error fetching bookings'
        });
    }
};
