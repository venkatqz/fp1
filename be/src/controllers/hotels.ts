import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';
import {
    SearchHotelRequestDTO,
    SearchAvailableHotelRequestDTO,
    ApiResponse
} from '../../apicontract';

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


