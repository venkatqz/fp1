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
    public static getHotels(
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
        });
    }
    /**
     * Add a new Hotel (Admin/Manager only)
     * @param requestBody
     * @returns Hotel Hotel created
     * @throws ApiError
     */
    public static postHotels(
        requestBody: Hotel,
    ): CancelablePromise<Hotel> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/hotels',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get Hotel Details with Room Types
     * Returns full hotel details along with embedded room types and their availability.
     * @param id
     * @returns any Hotel details with rooms
     * @throws ApiError
     */
    public static getHotels1(
        id: string,
    ): CancelablePromise<(Hotel & {
        rooms?: Array<(RoomType & {
            /**
             * Calculated availability for the dates
             */
            available?: number;
        })>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hotels/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get available rooms for a hotel
     * @param id
     * @returns RoomType List of rooms
     * @throws ApiError
     */
    public static getHotelsRooms(
        id: string,
    ): CancelablePromise<Array<RoomType>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hotels/{id}/rooms',
            path: {
                'id': id,
            },
        });
    }
}
