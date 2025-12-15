/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { UserRole } from '../models/UserRole';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a new user
     * @param requestBody
     * @returns any User created successfully
     * @throws ApiError
     */
    public static registerUser(
        requestBody: {
            name: string;
            email: string;
            password: string;
            role: UserRole;
            phone?: string;
        },
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
        data?: User;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * Login and get JWT token
     * @param requestBody
     * @returns any Login successful
     * @throws ApiError
     */
    public static loginUser(
        requestBody: {
            email: string;
            password: string;
        },
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
        data?: {
            token?: string;
            user?: User;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * Refresh Access Token
     * @param requestBody
     * @returns any Token refreshed successfully
     * @throws ApiError
     */
    public static refreshToken(
        requestBody: {
            refreshToken: string;
        },
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
        data?: {
            accessToken?: string;
            refreshToken?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh-token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Refresh token required`,
                401: `Invalid or expired refresh token`,
            },
        });
    }
}
