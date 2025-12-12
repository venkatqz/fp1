/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Amenity } from './Amenity';
export type RoomType = {
    id: string;
    hotelId: string;
    name: string;
    price: number;
    capacity: number;
    totalInventory: number;
    images: Array<string>;
    amenities: Array<Amenity>;
};

