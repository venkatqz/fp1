import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';
import {
    SearchHotelRequestDTO,
    SearchAvailableHotelRequestDTO,
    ApiResponse
} from '../../apicontract';

export const getHotels = async (req: Request, res: Response) => {
    try {
        const result = await HotelService.searchHotels(req.query as unknown as SearchHotelRequestDTO);

        const response: ApiResponse = {
            status: true,
            statusCode: 200,
            message: 'Hotels found',
            data: result // searchHotels returns { data: hotels, meta: ... }, which matches 'data' in our spec needing 'data' and 'meta'
        };

        res.json(response);
    } catch (error) {
        console.error('Search hotels error:', error);
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
    }
};

export const getHotelById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: false, statusCode: 400, message: 'Hotel ID is required' });
        }

        const hotel = await HotelService.getHotelById(id);

        if (!hotel) {
            return res.status(404).json({ status: false, statusCode: 404, message: 'Hotel not found' });
        }

        const response: ApiResponse = {
            status: true,
            statusCode: 200,
            message: 'Hotel details retrieved',
            data: hotel
        };

        res.json(response);
    } catch (error) {
        console.error('Get hotel error:', error);
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
    }
};

export const searchAvailableHotels = async (req: Request, res: Response) => {
    console.log('Hit searchAvailableHotels controller');
    try {
        const query = req.query as unknown as SearchAvailableHotelRequestDTO;
        // Reuse service logic (service accepts looser type, so this is fine)
        const result = await HotelService.searchHotels(query as unknown as SearchHotelRequestDTO);

        const response: ApiResponse = {
            status: true,
            statusCode: 200,
            message: 'Available hotels found',
            data: result
        };

        res.json(response);
    } catch (error) {
        console.error('Search available hotels error:', error);
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
    }
};

// ... keep create/update for admin (omitted for brevity unless requested)
export const createHotel = async (req: Request, res: Response) => {
    res.status(501).json({ message: 'Not implemented yet' });
};

export const updateHotel = async (req: Request, res: Response) => {
    res.status(501).json({ message: 'Not implemented yet' });
};
