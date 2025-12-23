import prisma from './src/lib/prisma';

async function testAvailabilityQuery() {
    const search = '%Mumbai%';
    const checkInDate = new Date('2025-12-22');
    const checkOutDate = new Date('2025-12-23');

    // Simulate the exact query
    const result: any = await prisma.$queryRaw`
        WITH RoomAvailabilityCTE AS (
            SELECT 
                rt.id as room_type_id,
                rt.hotel_id,
                rt.total_inventory,
                COALESCE(SUM(br.quantity), 0) as booked_quantity,
                (rt.total_inventory - COALESCE(SUM(br.quantity), 0)) as available_count
            FROM room_types rt
            LEFT JOIN booking_rooms br ON rt.id = br.room_type_id
            LEFT JOIN bookings b ON br.booking_id = b.id
                AND b.check_in < ${checkOutDate} 
                AND b.check_out > ${checkInDate} 
                AND (b.status = 'CONFIRMED' OR (b.status = 'PENDING_PAYMENT' AND b.expires_at > NOW()))
            WHERE rt.hotel_id IN (
                SELECT id FROM hotels 
                WHERE city LIKE ${search} OR address LIKE ${search} OR name LIKE ${search}
            )
            GROUP BY rt.id
        )
        SELECT * FROM RoomAvailabilityCTE WHERE room_type_id = 'rt_suite';
    `;

    console.log('Presidential Suite Availability:');
    console.log(JSON.stringify(result, null, 2));

    await prisma.$disconnect();
}

testAvailabilityQuery().catch(console.error);
