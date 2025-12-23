import prisma from './src/lib/prisma';

async function checkAll() {
    const all = await prisma.booking_rooms.findMany({
        where: { room_type_id: 'rt_suite' },
        include: { bookings: true }
    });

    console.log(`Total booking_rooms for rt_suite: ${all.length}\n`);

    all.forEach((br, i) => {
        const b = br.bookings;
        console.log(`${i + 1}. Booking ${br.booking_id}:`);
        console.log(`   Status: ${b.status}`);
        console.log(`   Dates: ${b.check_in.toISOString().split('T')[0]} to ${b.check_out.toISOString().split('T')[0]}`);
        console.log(`   Quantity: ${br.quantity}`);
        console.log(`   Expires: ${b.expires_at ? b.expires_at.toISOString() : 'N/A'}`);
        console.log('');
    });

    await prisma.$disconnect();
}

checkAll().catch(console.error);
