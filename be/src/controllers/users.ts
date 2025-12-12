import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { EarlyAccessRequestDTO, ApiResponse } from '../../apicontract';

export const createEarlyAccessUser = async (req: Request, res: Response) => {
    try {
        const dto = req.body as EarlyAccessRequestDTO;
        const result = await UserService.createEarlyAccessUser(dto);

        const response: ApiResponse = {
            status: true,
            statusCode: 201,
            message: 'User created successfully',
            data: result
        };

        res.status(201).json(response);
    } catch (error: any) {
        if (error.message === 'Email already exists') {
            const errorResponse: ApiResponse = {
                status: false,
                statusCode: 409,
                message: error.message
            };
            return res.status(409).json(errorResponse);
        }
        console.error('Create early access user error:', error);
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
    }
};
