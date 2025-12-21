export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    HOTEL_MANAGER = 'HOTEL_MANAGER',
    ADMIN = 'ADMIN'
}

export enum BookingStatus {
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
}

export enum PaymentMode {
    ONLINE = 'ONLINE',
    PAY_AT_HOTEL = 'PAY_AT_HOTEL'
}
