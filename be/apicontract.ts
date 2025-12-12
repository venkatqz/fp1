import { components, paths } from './src/types/api-contract';

// Helper to extract schema types
type Schema<T extends keyof components['schemas']> = components['schemas'][T];

// --- Enums ---
export type UserRole = Schema<'UserRole'>;
export type PaymentMode = Schema<'PaymentMode'>;
export type BookingStatus = Schema<'BookingStatus'>;

// --- DTOs (Data definitions) ---
export type User = Schema<'User'>;
export type Hotel = Schema<'Hotel'>;
export type RoomType = Schema<'RoomType'>;
export type Booking = Schema<'Booking'>;
export type Amenity = Schema<'Amenity'>;

// --- Request DTOs (Extracted from operations) ---
export type RegisterRequestDTO = paths['/auth/register']['post']['requestBody']['content']['application/json'];
export type LoginRequestDTO = paths['/auth/login']['post']['requestBody']['content']['application/json'];
export type SearchHotelRequestDTO = NonNullable<paths['/hotels']['get']['parameters']['query']>;
export type EarlyAccessRequestDTO = paths['/early-access-users']['post']['requestBody']['content']['application/json'];

// Helper types not strictly in OpenAPI but used in app
export interface RefreshTokenRequestDTO {
    refreshToken: string;
}

export interface AuthResponseDTO {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export interface ApiResponse<T = any> {
    status: boolean;
    statusCode: number;
    message: string;
    data?: T;
}

export interface SearchHotelResponseDTO {
    data: any[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

// ...
export type HotelDTO = Hotel;

export interface RefreshTokenResponseDTO {
    accessToken: string;
    refreshToken: string;
}

// Mapper function stub - in real app this should transform DB entity to DTO
export function toHotelDTO(hotel: any): HotelDTO {
    return {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        address: hotel.address,
        description: hotel.description,
        rating: typeof hotel.rating === 'object' && hotel.rating !== null ? Number(hotel.rating) : Number(hotel.rating || 0), // Handle Decimal from Prisma
        lowestPrice: typeof hotel.lowest_price === 'object' && hotel.lowest_price !== null ? Number(hotel.lowest_price) : Number(hotel.lowest_price || 0),
        images: hotel.images ? JSON.parse(hotel.images) : [],
        amenities: hotel.hotel_amenities ? hotel.hotel_amenities.map((ha: any) => ({
            id: ha.amenities.id,
            name: ha.amenities.name,
            scopeId: ha.amenities.scope_id
        })) : []
    };
}

