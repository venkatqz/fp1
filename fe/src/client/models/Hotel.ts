/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Amenity } from './Amenity';
import type { RoomType } from './RoomType';
export type Hotel = {
    id: string;
    name: string;
    city: string;
    address: string;
    description?: string | null;
    rating: number;
    lowestPrice?: number | null;
    images: Array<string>;
    amenities: Array<Amenity>;
    rooms?: Array<RoomType>;
};

