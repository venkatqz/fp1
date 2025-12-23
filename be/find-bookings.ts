import prisma from './src/lib/prisma';

async function findBookings() {
    const checkInDate = new Date('2025-12-22');
    const checkOutDate = new Date('2025-12-23');

    const bookings: any = await prisma.$queryRaw`
        SELECT 
            b.id,
            b.status,
            b.check_in,
            b.check_out,
            b.expires_at,
            br.room_type_id,
            br.quantity,
            rt.name as room_name
        FROM bookings b
        JOIN booking_rooms br ON b.id = br.booking_id
        JOIN room_types rt ON br.room_type_id = rt.id
        WHERE br.room_type_id = 'rt_suite'
          AND b.check_in < ${checkOutDate}
          AND b.check_out > ${checkInDate}
          AND (b.status = 'CONFIRMED' OR (b.status = 'PENDING_PAYMENT' AND b.expires_at > NOW()))
        ORDER BY b.check_in;
    `;

    console.log('Bookings overlapping with 2025-12-22 to 2025-12-23:');
    console.log(JSON.stringify(bookings, null, 2));
    console.log('\nTotal quantity:', bookings.reduce((sum: number, b: any) => sum + Number(b.quantity), 0));

    await prisma.$disconnect();
}

findBookings().catch(console.error);
