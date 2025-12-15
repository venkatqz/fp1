
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const searchTerm = 'Mumbai';
    const checkInDate = '2024-12-01';
    const checkOutDate = '2024-12-05';
    const limit = 12;
    const offset = 0;

    const search = searchTerm ? `%${searchTerm}%` : '%';

    console.log('Running raw SQL query...');
    console.time('QueryTime');

    const result = await prisma.$queryRaw`
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
        LIMIT ${limit} OFFSET ${offset};
    `;

    console.timeEnd('QueryTime');
    console.log('Query Result:', JSON.stringify(result, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
