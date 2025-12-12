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
     * @returns User User created successfully
     * @throws ApiError
     */
    public static postAuthRegister(
        requestBody: {
            name: string;
            email: string;
            password: string;
            role: UserRole;
            phone?: string;
        },
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Login and get JWT token
     * @param requestBody
     * @returns any Login successful
     * @throws ApiError
     */
    public static postAuthLogin(
        requestBody: {
            email: string;
            password: string;
        },
    ): CancelablePromise<{
        token?: string;
        user?: User;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
