import prisma from '../lib/prisma';
import { BookingRepository } from '../repositories/booking.repo';
import { BookingStatus, PaymentMode } from '../enums';


export const BookingService = {
    createIntent: async (data: any) => {
        const { hotelId, roomTypeId, rooms, checkIn, checkOut, guests, paymentMode, guestDetails } = data;

        // Normalize requested rooms
        const requestedRooms = (rooms && rooms.length > 0)
            ? rooms
            : (roomTypeId ? [{ roomTypeId, quantity: 1 }] : []);

        if (!hotelId || requestedRooms.length === 0 || !checkIn || !checkOut || !guests) {
            throw new Error('Missing required fields');
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Validate dates
        if (checkInDate >= checkOutDate) {
            throw new Error('Check-out date must be after check-in date');
        }

        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        return await prisma.$transaction(async (tx) => {
            let totalCapacity = 0;
            let totalBookingPrice = 0;
            const finalRoomsData = [];

            let guestList: { name: string; phone: string; email?: string }[] = [];

            for (const req of requestedRooms) {
                const roomType = await tx.room_types.findUnique({
                    where: { id: req.roomTypeId }
                });

                if (!roomType) {
                    throw new Error(`Room type ${req.roomTypeId} not found`);
                }

                const activeBookings = await BookingRepository.countActiveBookings(
                    req.roomTypeId,
                    checkInDate,
                    checkOutDate,
                    tx
                );

                const available = roomType.total_inventory - activeBookings;
                const quantity = req.quantity || 1;

                if (available < quantity) {
                    throw new Error(`Room ${roomType.name} not available. Requested: ${quantity}, Available: ${available}`);
                }

                totalCapacity += (roomType.capacity * quantity);
                const pricePerNight = Number(roomType.price);
                totalBookingPrice += (pricePerNight * quantity * nights);

                finalRoomsData.push({
                    roomTypeId: roomType.id,
                    quantity: quantity,
                    price: pricePerNight
                });
            }

            if (guests > totalCapacity) {
                throw new Error(`Room capacity exceeded. Max guests: ${totalCapacity}`);
            }

            const mode = paymentMode || PaymentMode.ONLINE;
            const validMode = await tx.payment_modes.findFirst({
                where: { name: mode }
            });

            const paymentModeId = validMode ? validMode.id : null;

            let initialStatus = BookingStatus.PENDING_PAYMENT;
            let expiresAt: Date | null = new Date(Date.now() + 15 * 60 * 1000);
            let paymentIntentId = '';
            let clientSecret = '';
            // let guestList = []; (removed, aggregated earlier)

            if (mode === PaymentMode.PAY_AT_HOTEL) {
                if (!guestDetails || (Array.isArray(guestDetails) && guestDetails.length === 0)) {
                    throw new Error('Guest details are required for Pay at Hotel');
                }

                // Normalize to array
                guestList = Array.isArray(guestDetails) ? guestDetails : [guestDetails];

                // Validate
                for (const g of guestList) {
                    if (!g.name || !g.phone) throw new Error('Guest name and phone are required');
                }

                initialStatus = BookingStatus.CONFIRMED;
                expiresAt = null;
                paymentIntentId = 'pay_at_hotel';
            } else {
                const tempId = `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                paymentIntentId = `pi_${tempId}`;
                clientSecret = `secret_${tempId}`;
            }

            const bookingId = `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

            await BookingRepository.create({
                id: bookingId,
                hotel_id: hotelId,
                payment_mode_id: paymentModeId,
                check_in: checkInDate,
                check_out: checkOutDate,
                total_price: totalBookingPrice as any,
                status: initialStatus,
                expires_at: expiresAt,
                user_id: data.userId || null,
                rooms: finalRoomsData,
                guests: guestList
            }, tx);

            return {
                bookingId,
                paymentIntentId,
                clientSecret,
                totalPrice: totalBookingPrice,
                currency: 'INR',
                expiresAt
            };
        });
    },

    confirmBooking: async (data: any) => {
        const { bookingId, paymentIntentId, guestDetails, paymentMode } = data;

        if (!bookingId) {
            throw new Error('Missing booking ID');
        }

        return await prisma.$transaction(async (tx) => {
            const booking = await BookingRepository.findById(bookingId, tx);

            if (!booking) {
                throw new Error('Booking not found');
            }

            if (booking.status === BookingStatus.CONFIRMED) {
                return booking; // Already confirmed
            }

            if (booking.status !== BookingStatus.PENDING_PAYMENT) {
                throw new Error('Invalid booking status');
            }

            // Check Expiry
            if (booking.expires_at && booking.expires_at < new Date()) {
                throw new Error('Booking expired');
            }

            // Create Guest Details (Multiple)
            let guests = [];
            if (guestDetails) {
                guests = Array.isArray(guestDetails) ? guestDetails : [guestDetails];
            } else {
                // If no guest details provided but required? 
                // Assuming payload mandates it or we use user profile. 
            }

            // Update Booking Status and Insert Guests
            const updated = await BookingRepository.update(bookingId, {
                status: BookingStatus.CONFIRMED,
                expires_at: null,
                transaction_id: paymentIntentId,
                guests: guests // Pass guests to repository update to insert them
            }, tx);

            return updated;
        });
    },


};
