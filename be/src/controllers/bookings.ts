import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { ApiResponse } from '../../apicontract';

export const createBookingIntent = async (req: Request, res: Response) => {
    try {
        console.log('[Bookings] Received Intent Request:', req.body);
        const result = await BookingService.createIntent(req.body);

        const response: ApiResponse = {
            status: true,
            statusCode: 200,
            message: 'Payment intent created',
            data: result
        };

        res.json(response);
    } catch (error: any) {
        if (error.message === 'Missing required fields') {
            return res.status(400).json({ status: false, statusCode: 400, message: error.message });
        }
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
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

export const getUserBookings = async (req: Request, res: Response) => {
    const bookings = await BookingService.getUserBookings();

    const response: ApiResponse = {
        status: true,
        statusCode: 200,
        message: 'User bookings retrieved',
        data: bookings
    };

    res.json(response);
};

export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: false, statusCode: 400, message: 'Booking ID is required' });
        }
        const result = await BookingService.cancelBooking(id);

        const response: ApiResponse = {
            status: true,
            statusCode: 200,
            message: 'Booking canceled successfully',
            data: result
        };

        res.json(response);
    } catch (error: any) {
        if (error.message === 'Booking not found') {
            return res.status(404).json({ status: false, statusCode: 404, message: error.message });
        }
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
    }
};
