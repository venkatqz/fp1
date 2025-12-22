import { components, paths } from './types/api-contract';

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
// /hotels doesn't exist, use /hotels/search params instead or custom type
export type SearchHotelRequestDTO = NonNullable<paths['/hotels/search']['get']['parameters']['query']>;
export type SearchAvailableHotelRequestDTO = NonNullable<paths['/hotels/search']['get']['parameters']['query']>;
// /early-access-users removed
export type EarlyAccessRequestDTO = any;

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
export type SearchAvailableHotelResponseDTO = paths['/hotels/search']['get']['responses']['200']['content']['application/json'];

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

        // Handle images
        images: typeof hotel.images === 'string' ? JSON.parse(hotel.images) : (hotel.images || []),

        // Handle Amenities
        amenities: hotel.amenities ? hotel.amenities : (hotel.hotel_amenities ? hotel.hotel_amenities.map((ha: any) => ({
            id: ha.amenities.id,
            name: ha.amenities.name,
            scopeId: ha.amenities.scope_id
        })) : []),

        // Handle Rooms: Support both relation-mapped (room_types) and pre-mapped (rooms)
        rooms: Array.isArray(hotel.rooms) ? hotel.rooms.map((rt: any) => ({
            id: rt.id,
            hotelId: rt.hotelId || rt.hotel_id || hotel.id, // Robust fallback
            name: rt.name,
            price: Number(rt.price),
            capacity: Number(rt.capacity),
            totalInventory: Number(rt.total_inventory),
            available: Number(rt.total_inventory),
            amenities: rt.amenities || [],
            images: rt.images ? (typeof rt.images === 'string' ? JSON.parse(rt.images) : rt.images) : []
        })) : (Array.isArray(hotel.room_types) ? hotel.room_types.map((rt: any) => ({
            id: rt.id,
            hotelId: hotel.id,
            name: rt.name,
            price: Number(rt.price),
            capacity: Number(rt.capacity),
            totalInventory: Number(rt.total_inventory),
            available: Number(rt.total_inventory),
            amenities: rt.room_amenities?.map((ra: any) => ra.amenities?.name) || [],
            images: rt.images ? (typeof rt.images === 'string' ? JSON.parse(rt.images) : rt.images) : []
        })) : [])
    };
}
