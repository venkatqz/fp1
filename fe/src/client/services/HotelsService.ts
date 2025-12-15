/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Hotel } from '../models/Hotel';
import type { RoomType } from '../models/RoomType';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HotelsService {
    /**
     * Search and List Hotels
     * Search for hotels with filtering options. Returns a paginated list of lightweight hotel objects.
     *
     * @param query Generic search term (name, city, etc.)
     * @param city Filter by location
     * @param checkIn Check-in date (YYYY-MM-DD)
     * @param checkOut Check-out date (YYYY-MM-DD)
     * @param guests Number of guests
     * @param sortBy
     * @param minPrice
     * @param maxPrice
     * @param page
     * @param limit
     * @returns any List of hotels found
     * @throws ApiError
     */
    public static searchHotels(
        query?: string,
        city?: string,
        checkIn?: string,
        checkOut?: string,
        guests?: number,
        sortBy?: 'price_low' | 'price_high' | 'rating',
        minPrice?: number,
        maxPrice?: number,
        page: number = 1,
        limit: number = 10,
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
        data?: {
            data?: Array<{
                id?: string;
                name?: string;
                city?: string;
                lowestPrice?: number;
                images?: Array<string>;
                rating?: number;
            }>;
            meta?: {
                total?: number;
                page?: number;
                limit?: number;
            };
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hotels',
            query: {
                'query': query,
                'city': city,
                'checkIn': checkIn,
                'checkOut': checkOut,
                'guests': guests,
                'sortBy': sortBy,
                'minPrice': minPrice,
                'maxPrice': maxPrice,
                'page': page,
                'limit': limit,
            },
            errors: {
                500: `Server Error`,
            },
        });
    }
    /**
     * Add a new Hotel (Admin/Manager only)
     * @param requestBody
     * @returns any Hotel created
     * @throws ApiError
     */
    public static addHotel(
        requestBody: Hotel,
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
        data?: Hotel;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/hotels',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
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
    /**
     * Get available rooms for a hotel
     * @param id
     * @returns any List of rooms
     * @throws ApiError
     */
    public static getHotelRooms(
        id: string,
    ): CancelablePromise<{
        status?: boolean;
        statusCode?: number;
        message?: string;
        data?: Array<RoomType>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hotels/{id}/rooms',
            path: {
                'id': id,
            },
        });
    }
}
