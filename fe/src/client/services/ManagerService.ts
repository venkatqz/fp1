/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Hotel } from '../models/Hotel';
import type { RoomType } from '../models/RoomType';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ManagerService {
    /**
     * Delete a Hotel
     * @param id
     * @returns any Hotel Deleted
     * @throws ApiError
     */
    public static deleteHotel(
        id: string,
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/hotels/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden (Not a manager)`,
            },
        });
    }
    /**
     * Get Hotels Managed by Current User
     * @returns any List of hotels
     * @throws ApiError
     */
    public static getMyHotels(): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
        data?: Array<Hotel>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hotels/my-hotels',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Create or Update a Hotel (Upsert)
     * @param requestBody
     * @returns any Hotel Created
     * @throws ApiError
     */
    public static createHotel(
        requestBody: Hotel,
    ): CancelablePromise<{
        status?: boolean;
        message?: string;
        data?: Hotel;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/hotels/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Create or Update a Room Type (Upsert)
     * @param requestBody
     * @returns any Room Type Created
     * @throws ApiError
     */
    public static createRoomType(
        requestBody: RoomType,
    ): CancelablePromise<{
        status?: boolean;
        message?: string;
        data?: RoomType;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/hotels/room-types',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a Room Type
     * @param id
     * @returns any Room Type Deleted
     * @throws ApiError
     */
    public static deleteRoomType(
        id: string,
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/hotels/room-types/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden (Not a manager)`,
            },
        });
    }
    /**
     * Get All Bookings for a Hotel (Manager Only)
     * @returns any List of bookings with rich details
     * @throws ApiError
     */
    public static getManagerBookings(): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
        data?: Array<{
            id?: string;
            hotelName?: string;
            status?: string;
            checkIn?: string;
            checkOut?: string;
            totalPrice?: number;
            guestName?: string;
            guestEmail?: string;
            guestPhone?: string;
            guests?: Array<{
                name?: string;
                phone?: string;
                email?: string;
            }>;
            /**
             * Summary string of rooms
             */
            rooms?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hotels/manager/bookings',
            errors: {
                403: `Forbidden (Not a manager)`,
            },
        });
    }
}
