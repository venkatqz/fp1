import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';
import { BookingStatus } from '../enums';


type PrismaTransactionClient = Prisma.TransactionClient;

export const BookingRepository = {

    countActiveBookings: async (
        roomTypeId: string,
        checkIn: Date,
        checkOut: Date,
        tx: PrismaTransactionClient = prisma
    ) => {

        const confirmedStatus = BookingStatus.CONFIRMED;
        const pendingStatus = BookingStatus.PENDING_PAYMENT;

        const result: any[] = await tx.$queryRaw`
            SELECT COALESCE(SUM(br.quantity), 0) as total
            FROM booking_rooms br
            JOIN bookings b ON br.booking_id = b.id
            WHERE br.room_type_id = ${roomTypeId}
              AND b.check_in < ${checkOut}
              AND b.check_out > ${checkIn}
              AND (
                  b.status = ${confirmedStatus}
                  OR (b.status = ${pendingStatus} AND b.expires_at > NOW())
              )
        `;

        return Number(result[0]?.total || 0);
    },

    // Create new booking
    create: async (
        bookingData: Omit<Prisma.bookingsUncheckedCreateInput, 'room_type_id'> & {
            room_type_id?: string;
            price_per_room?: number;
            rooms?: { roomTypeId: string; quantity: number; price: number }[];
            guests?: { name: string; phone: string; email?: string }[];
        },
        tx: PrismaTransactionClient = prisma
    ) => {
        const { room_type_id, price_per_room, rooms, guests, ...data } = bookingData;

        const roomsToBook = rooms && rooms.length > 0
            ? rooms
            : (room_type_id && price_per_room ? [{ roomTypeId: room_type_id, quantity: 1, price: price_per_room }] : []);

        if (roomsToBook.length === 0) {
            throw new Error("No rooms provided for booking");
        }

        // 1. Insert Booking (removed guest_details_id)
        await tx.$executeRaw`
            INSERT INTO bookings (
                id, user_id, hotel_id, payment_mode_id, 
                check_in, check_out, total_price, status, transaction_id, expires_at
            ) VALUES (
                ${data.id}, ${data.user_id}, ${data.hotel_id}, ${data.payment_mode_id},
                ${data.check_in}, ${data.check_out}, ${data.total_price}, ${data.status}, ${data.transaction_id || null}, ${data.expires_at || null}
            )
        `;

        // 2. Insert Booking Rooms
        for (const [i, r] of roomsToBook.entries()) {
            const brId = `br_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`;

            await tx.$executeRaw`
                INSERT INTO booking_rooms (
                    id, booking_id, room_type_id, quantity, price
                ) VALUES (
                    ${brId}, ${data.id}, ${r.roomTypeId}, ${r.quantity}, ${r.price}
                )
            `;
        }

        // 3. Insert Guests (if any)
        if (guests && guests.length > 0) {
            for (const [i, g] of guests.entries()) {
                const gId = `g_${Date.now()}_${i}`;
                // Using raw SQL for consistency, or prisma create
                await tx.$executeRaw`
                    INSERT INTO guest_details (id, booking_id, name, phone, email)
                    VALUES (${gId}, ${data.id}, ${g.name}, ${g.phone}, ${g.email || null})
                 `;
            }
        }

        return data as any;
    },


    createGuestDetails: async (
        data: Prisma.guest_detailsUncheckedCreateInput,
        tx: PrismaTransactionClient = prisma
    ) => {
        // Now guest details usually needs a booking_id, but can be created independently if schema allows nullable, 
        // but here we usually call it in context of a booking.
        return tx.guest_details.create({
            data: data as any
        });
    },

    findById: async (id: string, tx: PrismaTransactionClient = prisma) => {
        const result: any[] = await tx.$queryRaw`
            SELECT * FROM bookings WHERE id = ${id}
        `;
        return result[0] || null;
    },

    update: async (id: string, data: any, tx: PrismaTransactionClient = prisma) => {
        if (data.status === BookingStatus.CONFIRMED) {
            await tx.$executeRaw`
                UPDATE bookings 
                SET status = ${data.status},
                    expires_at = ${data.expires_at},
                    transaction_id = ${data.transaction_id}
                WHERE id = ${id}
            `;
            // If guests are provided in update
            if (data.guests && Array.isArray(data.guests)) {
                for (const [i, g] of data.guests.entries()) {
                    const gId = `g_upd_${Date.now()}_${i}`;
                    await tx.$executeRaw`
                        INSERT INTO guest_details (id, booking_id, name, phone, email)
                        VALUES (${gId}, ${id}, ${g.name}, ${g.phone}, ${g.email || null})
                     `;
                }
            }
            return { id, ...data };
        }

        return tx.bookings.update({
            where: { id },
            data
        });
    },

    findBookingsByManager: async (userId: string) => {
        return prisma.$queryRaw`
            SELECT 
                b.id, b.status, b.check_in, b.check_out, b.total_price,
                h.name as hotel_name,
                u.name as user_name, u.email as user_email, u.phone as user_phone,
                
                -- Aggregated Guests
                (
                    SELECT JSON_ARRAYAGG(JSON_OBJECT('name', gd.name, 'phone', gd.phone, 'email', gd.email))
                    FROM guest_details gd 
                    WHERE gd.booking_id = b.id
                ) as guest_list,
                
                rs.room_summary

            FROM bookings b
            JOIN hotel_managers hm ON b.hotel_id = hm.hotel_id
            JOIN hotels h ON b.hotel_id = h.id
            LEFT JOIN users u ON b.user_id = u.id
            
            -- Room summary subquery
            LEFT JOIN (
                SELECT 
                    br.booking_id, 
                    GROUP_CONCAT(CONCAT(rt.name, ' (', br.quantity, ')') SEPARATOR ', ') as room_summary
                FROM booking_rooms br
                JOIN room_types rt ON br.room_type_id = rt.id
                GROUP BY br.booking_id
            ) rs ON b.id = rs.booking_id

            WHERE hm.user_id = ${userId}
            ORDER BY b.check_in DESC
        `;
    },

    updateStatus: async (id: string, status: string, tx: PrismaTransactionClient = prisma) => {
        return tx.$executeRaw`
            UPDATE bookings SET status = ${status} WHERE id = ${id}
        `;
    },
};
