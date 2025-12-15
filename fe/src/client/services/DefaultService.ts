/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Create Early Access User
     * Registers a new user for early access.
     * @param requestBody
     * @returns any User created successfully
     * @throws ApiError
     */
    public static createEarlyAccessUser(
        requestBody: {
            email: string;
            name: string;
            primaryUseCase: string;
            company?: string;
            role?: string;
        },
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/early-access-users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                409: `Conflict - Email already exists`,
                500: `Server Error`,
            },
        });
    }
}
