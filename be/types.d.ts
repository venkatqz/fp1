export type UserRole = 'ADMIN' | 'HOTEL_MANAGER' | 'CUSTOMER';
export type PaymentMode = 'ONLINE' | 'PAY_AT_HOTEL';
export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type AmenityScope = 'HOTEL' | 'ROOM' | 'BOTH';
export interface Amenity {
    id: string;
    name: string;
    scope: AmenityScope;
    icon?: string;
}
export interface GuestDetails {
    id: string;
    name: string;
    phone: string;
}
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
    name: string;
    city: string;
    address: string;
    description: string;
    rating: number;
    lowestPrice: number;
    images: string[];
    amenities: Amenity[];
}
export interface RoomType {
    id: string;
    hotelId: string;
    name: string;
    price: number;
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
    guestDetails: GuestDetails;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    paymentMode: PaymentMode;
    status: BookingStatus;
    transactionId?: string;
}
export interface Review {
    id: string;
    hotelId: string;
    userId: string;
    bookingId: string;
    rating: number;
    comment: string;
    dateCreated: string;
}
//# sourceMappingURL=types.d.ts.map