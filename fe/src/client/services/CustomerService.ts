/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Hotel } from '../models/Hotel';
import type { RoomType } from '../models/RoomType';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CustomerService {
    /**
     * Search Available Hotels
     * Search for hotels by city/name with availability, filtering, and sorting.
     * @param query Search term for City, Hotel Name, or Address (e.g., "Mumbai")
     * @param checkIn Check-in date (YYYY-MM-DD)
     * @param checkOut Check-out date (YYYY-MM-DD)
     * @param guests Number of guests (to filter room capacity)
     * @param sortBy Sort order for results
     * @param page Page number for pagination
     * @param limit Number of results per page
     * @returns any Successful search results
     * @throws ApiError
     */
    public static searchAvailableHotels(
        query: string,
        checkIn: string,
        checkOut: string,
        guests: number = 1,
        sortBy: 'price_low' | 'price_high' | 'rating' = 'price_low',
        page: number = 1,
        limit: number = 10,
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        data?: Array<{
            /**
             * Hotel ID
             */
            id?: string;
            /**
             * Name of the hotel
             */
            name?: string;
            city?: string;
            address?: string;
            description?: string;
            avg_rating?: number;
            /**
             * Lowest price found among room types
             */
            starting_price?: number;
            /**
             * Comma-separated list of hotel amenities (from GROUP_CONCAT)
             */
            hotel_amenities?: string;
            /**
             * List of active managers (from JSON_ARRAYAGG)
             */
            manager_names?: Array<string>;
            /**
             * Nested list of rooms with their specific availability
             */
            rooms_details?: Array<{
                room_name?: string;
                price?: number;
                /**
                 * Calculated availability (Total - Booked)
                 */
                available_rooms?: number;
                amenities?: Array<string>;
            }>;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hotels/search',
            query: {
                'query': query,
                'checkIn': checkIn,
                'checkOut': checkOut,
                'guests': guests,
                'sortBy': sortBy,
                'page': page,
                'limit': limit,
            },
            errors: {
                400: `Bad Request (Invalid dates or missing parameters)`,
                401: `Unauthorized`,
                500: `Server Error`,
            },
        });
    }
    /**
     * Get Hotel Details with Room Types
     * Returns full hotel details along with embedded room types and their availability.
     * @param id
     * @returns any Hotel details with rooms
     * @throws ApiError
     */
    public static getHotelById(
        id: string,
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
        data?: (Hotel & {
            rooms?: Array<(RoomType & {
                /**
                 * Calculated availability for the dates
                 */
                available?: number;
            })>;
        });
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hotels/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Hotel not found`,
            },
        });
    }
}
