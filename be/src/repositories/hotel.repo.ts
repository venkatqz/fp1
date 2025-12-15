import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
export const HotelRepository = {

    findById: async (id: string) => {
        return prisma.hotels.findUnique({
            where: { id },
            include: {
                hotel_amenities: {
                    include: { amenities: true }
                },
                room_types: {
                    include: {
                        room_amenities: {
                            include: { amenities: true }
                        }
                    }
                },
                reviews: {
                    include: { users: true },
                    orderBy: { date_created: 'desc' }
                }
            }
        });
    },

    findAvailableHotels: async (
        searchTerm: string,
        checkInDate: string,
        checkOutDate: string,
        limit: number,
        offset: number,
        sortBy: string = 'rating'
    ) => {
        // Safe defaults if empty
        const search = searchTerm ? `%${searchTerm}%` : '%';

        // Dynamic Order By Clause using Prisma.sql to prevent injection but allow dynamic columns
        let orderByClause = Prisma.sql`ORDER BY h.rating DESC`; // default
        if (sortBy === 'price_low') {
            orderByClause = Prisma.sql`ORDER BY starting_price ASC`;
        } else if (sortBy === 'price_high') {
            orderByClause = Prisma.sql`ORDER BY starting_price DESC`;
        } else if (sortBy === 'rating') {
            orderByClause = Prisma.sql`ORDER BY h.rating DESC`;
        }

        // Note: Raw queries return generic objects, so we need to map them carefully in Service layer
        return prisma.$queryRaw`
            WITH RoomAmenitiesCTE AS (
                SELECT 
                    ra.room_type_id, 
                    JSON_ARRAYAGG(a.name) as amenity_list
                FROM room_amenities ra
                JOIN amenities a ON ra.amenity_id = a.id
                GROUP BY ra.room_type_id
            ),
            HotelAmenitiesCTE AS (
                SELECT 
                    ha.hotel_id, 
                    GROUP_CONCAT(DISTINCT a.name SEPARATOR ',') as amenity_list
                FROM hotel_amenities ha
                JOIN amenities a ON ha.amenity_id = a.id
                GROUP BY ha.hotel_id
            ),
            HotelManagersCTE AS (
                SELECT 
                    hm.hotel_id, 
                    JSON_ARRAYAGG(u.name) as manager_names
                FROM hotel_managers hm
                JOIN users u ON hm.user_id = u.id
                WHERE hm.is_active = TRUE
                GROUP BY hm.hotel_id
            ), 
            RoomAvailabilityCTE AS (
                SELECT 
                    rt.id as room_type_id,
                    (rt.total_inventory - COUNT(b.id)) as available_count
                FROM room_types rt
                LEFT JOIN bookings b ON rt.id = b.room_type_id 
                    AND b.check_in < ${checkOutDate} 
                    AND b.check_out > ${checkInDate} 
                    AND b.status = 'CONFIRMED'
                GROUP BY rt.id
            )

            SELECT 
                h.id, h.name, h.city, h.address, h.description, h.rating, h.images,
                MIN(rt.price) as starting_price,
                JSON_ARRAYAGG( 
                    JSON_OBJECT(
                        'room_name', rt.name,
                        'price', rt.price,
                        'amenities', COALESCE(ra.amenity_list, '[]'),
                        'available_rooms', COALESCE(av.available_count, rt.total_inventory)
                    )
                ) as rooms_details,
                ha.amenity_list as hotel_amenities,
                hm.manager_names as manager_names
            FROM hotels as h
            LEFT JOIN room_types as rt ON h.id = rt.hotel_id
            LEFT JOIN RoomAmenitiesCTE as ra ON rt.id = ra.room_type_id
            LEFT JOIN HotelAmenitiesCTE ha ON h.id = ha.hotel_id
            LEFT JOIN HotelManagersCTE hm ON h.id = hm.hotel_id
            LEFT JOIN RoomAvailabilityCTE AS av ON rt.id = av.room_type_id
            WHERE (h.city LIKE ${search} OR h.address LIKE ${search} OR h.name LIKE ${search})
            GROUP BY h.id
            HAVING MAX(COALESCE(av.available_count, rt.total_inventory)) >= 1
            ${orderByClause}
            LIMIT ${limit} OFFSET ${offset};
        `;
    }
};
