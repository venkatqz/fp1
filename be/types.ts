
// --- 1. Enums & Unions (Matching SQL Constraints) ---
export type UserRole = 'ADMIN' | 'HOTEL_MANAGER' | 'CUSTOMER';
export type PaymentMode = 'ONLINE' | 'PAY_AT_HOTEL';
export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type AmenityScope = 'HOTEL' | 'ROOM' | 'BOTH';

// --- 2. Helper Interfaces ---
export interface Amenity {
    id: string;
    name: string;
    scope: AmenityScope;
    icon?: string; // Optional: Useful for frontend icon mapping
}

export interface GuestDetails {
    id: string; // Matches SQL Primary Key
    name: string;
    phone: string;
}

// --- 3. Core Entities ---

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    phone?: string;
}

export interface Hotel {
    id: string;
    // managerId is REMOVED (It is now handled by the hotel_managers bridge table)
    name: string;
    city: string;
    address: string;
    description: string;
    rating: number;      // Average calculated from Reviews
    lowestPrice: number;
    images: string[];    // Array of URLs

    // Now returns full objects, not just strings
    amenities: Amenity[];
}

export interface RoomType {
    id: string;
    hotelId: string;
    name: string;
    price: number;

    // Matches SQL 'capacity INT' (Total people allowed)
    capacity: number;

    totalInventory: number;
    amenities: Amenity[];
    images: string[];
}

export interface Booking {
    id: string;
    userId: string;
    hotelId: string;
    roomTypeId: string;

    // Embedded guest details (fetched via JOIN usually)
    guestDetails: GuestDetails;

    checkIn: string;  // ISO Date String "2025-12-01"
    checkOut: string;

    totalPrice: number;
    paymentMode: PaymentMode;
    status: BookingStatus;
    transactionId?: string; // Nullable for PAY_AT_HOTEL
}

export interface Review {
    id: string;
    hotelId: string;
    userId: string;
    bookingId: string;
    rating: number; // 1 to 5
    comment: string;
    dateCreated: string; // ISO Date String
}
