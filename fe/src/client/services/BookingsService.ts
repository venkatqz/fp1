/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Booking } from '../models/Booking';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BookingsService {
    /**
     * Step 1 - Calculate Price & Initiate Payment
     * Calculates total price based on formatting, checks availability/inventory reduction,
     * and returns a Stripe Payment Intent client secret.
     *
     * @param requestBody
     * @returns any Payment Intent Created
     * @throws ApiError
     */
    public static postBookingsIntent(
        requestBody: {
            hotelId: string;
            roomTypeId: string;
            checkIn: string;
            checkOut: string;
            guests: number;
        },
    ): CancelablePromise<{
        paymentIntentId?: string;
        clientSecret?: string;
        totalPrice?: number;
        currency?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/bookings/intent',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error or room not available`,
            },
        });
    }
    /**
     * Step 2 - Finalize Booking
     * Called after successful payment on the client side to persist the booking in the DB.
     * @param requestBody
     * @returns Booking Booking Confirmed
     * @throws ApiError
     */
    public static postBookingsConfirm(
        requestBody: {
            paymentIntentId: string;
            guestDetails?: {
                name?: string;
                email?: string;
                phone?: string;
            };
        },
    ): CancelablePromise<Booking> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/bookings/confirm',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get user's booking history
     * @returns Booking List of user bookings
     * @throws ApiError
     */
    public static getBookingsMyBookings(): CancelablePromise<Array<Booking>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/bookings/my-bookings',
        });
    }
}
