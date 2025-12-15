import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Clean up database (optional, but good for "populating")
    await prisma.reviews.deleteMany();
    await prisma.guest_details.deleteMany();
    await prisma.bookings.deleteMany();
    await prisma.room_amenities.deleteMany();
    await prisma.room_types.deleteMany();
    await prisma.hotel_amenities.deleteMany();
    await prisma.hotel_managers.deleteMany();
    await prisma.hotels.deleteMany();
    await prisma.users.deleteMany();
    await prisma.amenities.deleteMany();
    await prisma.amenity_scopes.deleteMany();
    // booking_status is not a model, it is a string field
    await prisma.payment_modes.deleteMany();
    await prisma.roles.deleteMany();

    // 2. Static Data

    // Roles
    const roleCustomer = await prisma.roles.create({ data: { id: 'role_customer', name: 'CUSTOMER' } });
    const roleManager = await prisma.roles.create({ data: { id: 'role_manager', name: 'HOTEL_MANAGER' } });
    const roleAdmin = await prisma.roles.create({ data: { id: 'role_admin', name: 'ADMIN' } });

    // Payment Modes
    const modeOnline = await prisma.payment_modes.create({ data: { id: 'pm_online', name: 'ONLINE' } });
    const modePayAtHotel = await prisma.payment_modes.create({ data: { id: 'pm_hotel', name: 'PAY_AT_HOTEL' } });

    // Amenity Scopes
    const scopeHotel = await prisma.amenity_scopes.create({ data: { id: 'scope_hotel', name: 'HOTEL' } });
    const scopeRoom = await prisma.amenity_scopes.create({ data: { id: 'scope_room', name: 'ROOM' } });

    // Amenities
    const amWifi = await prisma.amenities.create({ data: { id: 'am_wifi', name: 'Free WiFi', scope_id: scopeHotel.id } });
    const amPool = await prisma.amenities.create({ data: { id: 'am_pool', name: 'Swimming Pool', scope_id: scopeHotel.id } });
    const amParking = await prisma.amenities.create({ data: { id: 'am_parking', name: 'Parking', scope_id: scopeHotel.id } });
    const amGym = await prisma.amenities.create({ data: { id: 'am_gym', name: 'Gym', scope_id: scopeHotel.id } });

    const amAC = await prisma.amenities.create({ data: { id: 'am_ac', name: 'Air Conditioning', scope_id: scopeRoom.id } });
    const amTV = await prisma.amenities.create({ data: { id: 'am_tv', name: 'Flat-screen TV', scope_id: scopeRoom.id } });
    const amMiniBar = await prisma.amenities.create({ data: { id: 'am_minibar', name: 'Mini Bar', scope_id: scopeRoom.id } });
    const amBalcony = await prisma.amenities.create({ data: { id: 'am_balcony', name: 'Balcony', scope_id: scopeRoom.id } });

    // Users
    const passwordHash = await bcrypt.hash('password123', 10);

    const userAdmin = await prisma.users.create({
        data: {
            id: 'u_admin',
            name: 'Admin User',
            email: 'admin@example.com',
            password_hash: passwordHash,
            role_id: roleAdmin.id,
            phone: '1234567890'
        }
    });

    const userManager1 = await prisma.users.create({
        data: {
            id: 'u_manager1',
            name: 'Manager One',
            email: 'manager1@example.com',
            password_hash: passwordHash,
            role_id: roleManager.id,
            phone: '9876543210'
        }
    });

    const userCustomer1 = await prisma.users.create({
        data: {
            id: 'u_cust1',
            name: 'John Doe',
            email: 'john@example.com',
            password_hash: passwordHash,
            role_id: roleCustomer.id,
            phone: '5555555555'
        }
    });

    // Hotels
    const hotel1 = await prisma.hotels.create({
        data: {
            id: 'h_1',
            name: 'Grand Luxury Hotel',
            city: 'Mumbai',
            address: '123 Marine Drive, Mumbai, Maharashtra',
            description: 'Experience luxury like never before with sea-facing rooms and exquisite dining.',
            rating: 4.8,
            lowest_price: 5000,
            images: JSON.stringify(['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800']),
        }
    });

    const hotel2 = await prisma.hotels.create({
        data: {
            id: 'h_2',
            name: 'Cozy Stay Inn',
            city: 'Bangalore',
            address: '456 Koramangala 4th Block, Bangalore, Karnataka',
            description: 'A comfortable and affordable stay in the heart of the city.',
            rating: 4.2,
            lowest_price: 2500,
            images: JSON.stringify(['https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800']),
        }
    });

    // Hotel Amenities
    await prisma.hotel_amenities.createMany({
        data: [
            { hotel_id: hotel1.id, amenity_id: amPool.id },
            { hotel_id: hotel1.id, amenity_id: amWifi.id },
            { hotel_id: hotel1.id, amenity_id: amGym.id },
            { hotel_id: hotel1.id, amenity_id: amParking.id },
            { hotel_id: hotel2.id, amenity_id: amWifi.id },
            { hotel_id: hotel2.id, amenity_id: amParking.id },
        ]
    });

    // Hotel Managers
    await prisma.hotel_managers.create({
        data: { hotel_id: hotel1.id, user_id: userManager1.id, is_active: true }
    });

    // Room Types
    const roomDeluxe = await prisma.room_types.create({
        data: {
            id: 'rt_deluxe',
            hotel_id: hotel1.id,
            name: 'Deluxe Sea View',
            price: 5000,
            capacity: 2,
            total_inventory: 10,
            images: JSON.stringify(['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800'])
        }
    });

    const roomSuite = await prisma.room_types.create({
        data: {
            id: 'rt_suite',
            hotel_id: hotel1.id,
            name: 'Presidential Suite',
            price: 15000,
            capacity: 4,
            total_inventory: 2,
            images: JSON.stringify(['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800'])
        }
    });

    const roomStandard = await prisma.room_types.create({
        data: {
            id: 'rt_standard',
            hotel_id: hotel2.id,
            name: 'Standard AC Room',
            price: 2500,
            capacity: 2,
            total_inventory: 20,
            images: JSON.stringify(['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800'])
        }
    });

    // Room Amenities
    await prisma.room_amenities.createMany({
        data: [
            { room_type_id: roomDeluxe.id, amenity_id: amAC.id },
            { room_type_id: roomDeluxe.id, amenity_id: amTV.id },
            { room_type_id: roomDeluxe.id, amenity_id: amBalcony.id },
            { room_type_id: roomSuite.id, amenity_id: amAC.id },
            { room_type_id: roomSuite.id, amenity_id: amTV.id },
            { room_type_id: roomSuite.id, amenity_id: amBalcony.id },
            { room_type_id: roomSuite.id, amenity_id: amMiniBar.id },
            { room_type_id: roomStandard.id, amenity_id: amAC.id },
            { room_type_id: roomStandard.id, amenity_id: amTV.id },
        ]
    });

    // Bookings & Guest Details
    // Booking 1: Past Confirmed
    const booking1 = await prisma.bookings.create({
        data: {
            id: 'bk_1',
            user_id: userCustomer1.id,
            hotel_id: hotel1.id,
            room_type_id: roomDeluxe.id,
            payment_mode_id: modeOnline.id,
            check_in: new Date('2024-01-10'),
            check_out: new Date('2024-01-12'),
            total_price: 10000,
            status: 'CONFIRMED',
            transaction_id: 'tx_12345'
        }
    });

    await prisma.guest_details.create({
        data: {
            id: 'gd_1',
            name: 'John Doe',
            phone: '5555555555',
            booking_id: booking1.id
        }
    });

    // Booking 2: Future Confirmed
    const booking2 = await prisma.bookings.create({
        data: {
            id: 'bk_2',
            user_id: userCustomer1.id,
            hotel_id: hotel2.id,
            room_type_id: roomStandard.id,
            payment_mode_id: modePayAtHotel.id,
            check_in: new Date('2024-12-25'),
            check_out: new Date('2024-12-27'),
            total_price: 5000,
            status: 'CONFIRMED'
        }
    });

    await prisma.guest_details.create({
        data: {
            id: 'gd_2',
            name: 'Jane Doe',
            phone: '5555555556',
            booking_id: booking2.id
        }
    });

    // Reviews
    await prisma.reviews.create({
        data: {
            id: 'rev_1',
            hotel_id: hotel1.id,
            user_id: userCustomer1.id,
            booking_id: booking1.id,
            rating: 5,
            comment: 'Amazing stay! The pool was fantastic.',
            date_created: new Date('2024-01-13')
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
