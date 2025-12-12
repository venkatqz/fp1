/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingStatus } from './BookingStatus';
import type { PaymentMode } from './PaymentMode';
export type Booking = {
    id: string;
    userId: string;
    hotelId: string;
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    guestDetails: {
        name: string;
        email: string;
        phone: string;
    };
    totalPrice: number;
    paymentMode: PaymentMode;
    status: BookingStatus;
    transactionId?: string;
};

