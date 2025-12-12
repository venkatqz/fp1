
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Create Amenities
    const wifi = await prisma.amenities.upsert({
        where: { id: 'am_wifi' },
        update: {},
        create: { id: 'am_wifi', name: 'Free WiFi', scope_id: 'BOTH' }
    });

    // 2. Create Hotels
    const hotel1 = await prisma.hotels.upsert({
        where: { id: 'h_mumbai_1' },
        update: {},
        create: {
            id: 'h_mumbai_1',
            name: 'Grand Mumbai Hotel',
            city: 'Mumbai',
            address: '123 Marine Drive',
            description: 'Luxury stay near the sea',
            rating: 4.5,
            lowest_price: 5000,
            images: '["https://via.placeholder.com/300"]'
        }
    });

    const hotel2 = await prisma.hotels.upsert({
        where: { id: 'h_bangalore_1' },
        update: {},
        create: {
            id: 'h_bangalore_1',
            name: 'Bangalore Tech Stay',
            city: 'Bangalore',
            address: '456 Tech Park',
            description: 'Business hotel',
            rating: 4.0,
            lowest_price: 3500,
            images: '["https://via.placeholder.com/300"]'
        }
    });

    // Bulk Create 20 Mumbai Hotels for Pagination Testing
    const mumbaiHotels = [];
    for (let i = 2; i <= 21; i++) {
        const price = 2000 + Math.floor(Math.random() * 8000);
        const rating = (3 + Math.random() * 2).toFixed(1);

        const hotel = await prisma.hotels.upsert({
            where: { id: `h_mumbai_${i}` },
            update: {},
            create: {
                id: `h_mumbai_${i}`,
                name: `Mumbai Hotel ${i}`,
                city: 'Mumbai',
                address: `Street ${i}, Mumbai`,
                description: `Description for hotel ${i}`,
                rating: parseFloat(rating),
                lowest_price: price,
                images: '["https://via.placeholder.com/300"]'
            }
        });
        mumbaiHotels.push(hotel);

        // Create a Standard Room for each
        await prisma.room_types.upsert({
            where: { id: `rt_mumbai_${i}_std` },
            update: {},
            create: {
                id: `rt_mumbai_${i}_std`,
                hotel_id: hotel.id,
                name: 'Standard Room',
                price: price,
                capacity: 2,
                total_inventory: 5,
                images: '[]'
            }
        });
    }

    // Bulk Create 15 Kolkata Hotels
    for (let i = 1; i <= 15; i++) {
        const price = 1500 + Math.floor(Math.random() * 6000);
        const rating = (3 + Math.random() * 2).toFixed(1);

        const hotel = await prisma.hotels.upsert({
            where: { id: `h_kolkata_${i}` },
            update: {},
            create: {
                id: `h_kolkata_${i}`,
                name: `Kolkata Heritage Stay ${i}`,
                city: 'Kolkata',
                address: `Park Street ${i}, Kolkata`,
                description: `Classic stay in the city of joy ${i}`,
                rating: parseFloat(rating),
                lowest_price: price,
                images: '["https://via.placeholder.com/300"]'
            }
        });

        // Create a Standard Room for each
        await prisma.room_types.upsert({
            where: { id: `rt_kolkata_${i}_std` },
            update: {},
            create: {
                id: `rt_kolkata_${i}_std`,
                hotel_id: hotel.id,
                name: 'Deluxe Room',
                price: price,
                capacity: 2,
                total_inventory: 8,
                images: '[]'
            }
        });
    }

    // 3. Create Room Types
    // Mumbai Hotel Rooms
    await prisma.room_types.upsert({
        where: { id: 'rt_mumbai_std' },
        update: {},
        create: {
            id: 'rt_mumbai_std',
            hotel_id: hotel1.id,
            name: 'Standard Room',
            price: 5000,
            capacity: 2,
            total_inventory: 5,
            images: '[]'
        }
    });

    await prisma.room_types.upsert({
        where: { id: 'rt_mumbai_suite' },
        update: {},
        create: {
            id: 'rt_mumbai_suite',
            hotel_id: hotel1.id,
            name: 'Royal Suite',
            price: 12000,
            capacity: 4,
            total_inventory: 2,
            images: '[]'
        }
    });

    // Bangalore Hotel Rooms
    await prisma.room_types.upsert({
        where: { id: 'rt_bang_std' },
        update: {},
        create: {
            id: 'rt_bang_std',
            hotel_id: hotel2.id,
            name: 'Business Room',
            price: 3500,
            capacity: 2,
            total_inventory: 10,
            images: '[]'
        }
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
