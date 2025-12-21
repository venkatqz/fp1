import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

const upsertAmenities = async (tx: any, hotelId: string, amenities: string[]) => {

    if (!amenities) return;

    // 1. Clear existing links for this hotel
    await tx.hotel_amenities.deleteMany({
        where: { hotel_id: hotelId }
    });

    if (amenities.length === 0) return;

    for (const name of amenities) {
        // 2. Find or Create Amenity
        // We use findFirst instead of upsert just in case 'name' isn't marked unique in schema
        let amenity = await tx.amenities.findFirst({
            where: { name: name }
        });

        if (!amenity) {
            amenity = await tx.amenities.create({
                data: {
                    id: randomUUID(),
                    name: name
                }
            });
        }

        // 3. Link Amenity to Hotel
        await tx.hotel_amenities.create({
            data: {
                hotel_id: hotelId,
                amenity_id: amenity.id
            }
        });
    }
};
export const HotelRepository = {

    //search
    findAvailableHotels: async (
        searchTerm: string,
        checkInDate: string,
        checkOutDate: string,
        limit: number,
        offset: number,
        sortBy: string = 'rating'
    ) => {
        const search = searchTerm ? `%${searchTerm}%` : '%';


        let orderByClause = Prisma.sql`ORDER BY h.rating DESC`;
        if (sortBy === 'price_low') {
            orderByClause = Prisma.sql`ORDER BY starting_price ASC`;
        } else if (sortBy === 'price_high') {
            orderByClause = Prisma.sql`ORDER BY starting_price DESC`;
        }

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
                    (rt.total_inventory - COALESCE(SUM(br.quantity), 0)) as available_count
                FROM room_types rt
                LEFT JOIN booking_rooms br ON rt.id = br.room_type_id
                LEFT JOIN bookings b ON br.booking_id = b.id
                    AND b.check_in < ${checkOutDate} 
                    AND b.check_out > ${checkInDate} 
                    AND (b.status = 'CONFIRMED' OR (b.status = 'PENDING_PAYMENT' AND b.expires_at > NOW()))
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
    },
    update: async (id: string, userId: string, data: any) => {
        // Whitelist 
        const allowedColumns = ['name', 'city', 'address', 'description', 'images'];
        const updateData: any = {};

        allowedColumns.forEach(col => {
            if (data[col] !== undefined) {
                updateData[col] = data[col];
            }
        });

        if (Object.keys(updateData).length === 0 && !data.amenities) {
            return 0;
        }

        return prisma.$transaction(async (tx) => {
            let count = 0;

            if (Object.keys(updateData).length > 0) {
                const result = await tx.hotels.updateMany({
                    where: {
                        id: id,
                        hotel_managers: {
                            some: {
                                user_id: userId
                            }
                        }
                    },
                    data: updateData
                });
                count = result.count;
            } else {
                // Determine if user has access if we are only updating amenities
                const countResult = await tx.hotels.count({
                    where: {
                        id: id,
                        hotel_managers: {
                            some: {
                                user_id: userId
                            }
                        }
                    }
                });
                count = countResult;
            }

            if (count > 0 && data.amenities) {
                await upsertAmenities(tx, id, data.amenities);
            }

            return count;
        });
    },

    create: async (data: any, userId: string) => {
        const { id, name, city, address, description, rating, lowest_price, images, amenities } = data;

        return prisma.$transaction(async (tx) => {

            await tx.$executeRaw`
                INSERT INTO hotels (id, name, city, address, description, rating, lowest_price, images)
                VALUES (${id}, ${name}, ${city}, ${address}, ${description}, ${rating}, ${lowest_price}, ${images})
            `;


            await tx.$executeRaw`
                INSERT INTO hotel_managers (hotel_id, user_id, is_active)
                VALUES (${id}, ${userId}, 1)
            `;

            if (amenities) {
                await upsertAmenities(tx, id, amenities);
            }

            return data;
        });
    },


    delete: async (id: string, userId: string) => {

        //  If there are Bookings, this will fail if foreign keys on Bookings are strict (RESTRICT).


        return prisma.$transaction(async (tx) => {
            // 1. Verify ownership first
            const hotel = await tx.hotels.findFirst({
                where: {
                    id: id,
                    hotel_managers: { some: { user_id: userId, is_active: true } }
                }
            });

            if (!hotel) return 0; // Not found or not authorized

            // 2. Delete Hotel Amenities
            await tx.hotel_amenities.deleteMany({
                where: { hotel_id: id }
            });

            // 3. Delete Hotel Managers link
            await tx.hotel_managers.deleteMany({
                where: { hotel_id: id }
            });

            // 4. Handle Room Types (and their amenities)
            // First get all room type IDs
            const roomTypes = await tx.room_types.findMany({
                where: { hotel_id: id },
                select: { id: true }
            });
            const roomTypeIds = roomTypes.map(rt => rt.id);

            if (roomTypeIds.length > 0) {
                // Delete Room Amenities for these rooms
                await tx.room_amenities.deleteMany({
                    where: { room_type_id: { in: roomTypeIds } }
                });

                // Delete the Room Types
                await tx.room_types.deleteMany({
                    where: { id: { in: roomTypeIds } }
                });
            }

            // 5. Finally Delete the Hotel
            await tx.hotels.delete({
                where: { id: id }
            });

            return 1;
        });
    },

    findByManager: async (userId: string) => {
        return prisma.$queryRaw`
WITH agg_amenities AS (
    SELECT ha.hotel_id, JSON_ARRAYAGG(a.name) AS names
    FROM hotel_amenities ha
    JOIN amenities a ON ha.amenity_id = a.id
    GROUP BY ha.hotel_id
),
agg_rooms AS (
    SELECT hotel_id,
           JSON_ARRAYAGG(
               JSON_OBJECT('name', name, 'price', price, 'inventory', total_inventory)
           ) AS summary
    FROM room_types
    GROUP BY hotel_id
),
active_hotels AS (
    SELECT hotel_id
    FROM hotel_managers
    WHERE user_id = ${userId}
      AND is_active = 1
)
SELECT h.id, h.name, h.city, h.rating, -- avoid h.* if not needed
       COALESCE(agg_amenities.names, '[]') AS amenity_names,
       COALESCE(agg_rooms.summary, '[]') AS room_summary
FROM hotels h
JOIN active_hotels ah ON h.id = ah.hotel_id
LEFT JOIN agg_amenities ON h.id = agg_amenities.hotel_id
LEFT JOIN agg_rooms ON h.id = agg_rooms.hotel_id;
        `;
    }





};
