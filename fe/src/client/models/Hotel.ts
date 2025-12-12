/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Amenity } from './Amenity';
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
};

