import { components, paths } from './src/types/api-contract';
type Schema<T extends keyof components['schemas']> = components['schemas'][T];
export type UserRole = Schema<'UserRole'>;
export type PaymentMode = Schema<'PaymentMode'>;
export type BookingStatus = Schema<'BookingStatus'>;
export type User = Schema<'User'>;
export type Hotel = Schema<'Hotel'>;
export type RoomType = Schema<'RoomType'>;
export type Booking = Schema<'Booking'>;
export type Amenity = Schema<'Amenity'>;
export type RegisterRequestDTO = paths['/auth/register']['post']['requestBody']['content']['application/json'];
export type LoginRequestDTO = paths['/auth/login']['post']['requestBody']['content']['application/json'];
export type SearchHotelRequestDTO = NonNullable<paths['/hotels']['get']['parameters']['query']>;
export type SearchAvailableHotelRequestDTO = NonNullable<paths['/hotels/search']['get']['parameters']['query']>;
export type EarlyAccessRequestDTO = paths['/early-access-users']['post']['requestBody']['content']['application/json'];
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
export type HotelDTO = Hotel;
export interface RefreshTokenResponseDTO {
    accessToken: string;
    refreshToken: string;
}
export declare function toHotelDTO(hotel: any): HotelDTO;
export {};
//# sourceMappingURL=apicontract.d.ts.map