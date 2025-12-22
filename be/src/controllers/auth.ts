
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import {
    RegisterRequestDTO,
    LoginRequestDTO,
    AuthResponseDTO,
    ApiResponse,
    JWTPayload
} from '../apicontract';

export const register = async (req: Request, res: Response) => {
    try {
        const dto = req.body as RegisterRequestDTO;
        const result = await AuthService.register(dto);

        const finalResponse: ApiResponse = {
            status: true,
            statusCode: 201,
            message: 'User created successfully',
            data: result.user
        };

        res.status(201).json(finalResponse);
    } catch (error: any) {
        if (error.message === 'Email already exists') {
            const errorResponse: ApiResponse = {
                status: false,
                statusCode: 400, // Conflict is usually 409 but I used 400 in code before. Spec says 400 for bad request.
                message: error.message
            };
            return res.status(400).json(errorResponse);
        }
        console.error('Register error:', error);
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const dto = req.body as LoginRequestDTO;
        const result = await AuthService.login(dto);

        const response: ApiResponse = {
            status: true,
            statusCode: 200,
            message: 'Login successful',
            data: {
                token: result.accessToken,
                user: result.user
            }
        };

        res.json(response);
    } catch (error: any) {
        if (error.message === 'Invalid credentials') {
            const errorResponse: ApiResponse = {
                status: false,
                statusCode: 401,
                message: error.message
            };
            return res.status(401).json(errorResponse);
        }
        console.error('Login error:', error);
        res.status(500).json({ status: false, statusCode: 500, message: 'Internal server error' });
    }
};




