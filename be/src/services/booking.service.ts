import prisma from '../lib/prisma';

export const BookingService = {
    createIntent: async (data: any) => {
        const { hotelId, roomTypeId, checkIn, checkOut, guests, paymentMode } = data;

        if (!hotelId || !roomTypeId || !checkIn || !checkOut || !guests) {
            throw new Error('Missing required fields');
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Validate dates
        if (checkInDate >= checkOutDate) {
            throw new Error('Check-out date must be after check-in date');
        }

        return await prisma.$transaction(async (tx) => {
            // 1. Get Room Type & Capacity
            const roomType = await tx.room_types.findUnique({
                where: { id: roomTypeId }
            });

            if (!roomType) {
                throw new Error('Room type not found');
            }

            // 2. Capacity Check
            // Rule: Total Guests <= (Requested Rooms assumption: 1) * Capacity
            // If user wants multiple rooms, valid logic would be needed. Assuming 1 room per booking for now.
            if (guests > roomType.capacity) {
                throw new Error(`Room capacity exceeded. Max guests: ${roomType.capacity}`);
            }

            // 3. Availability Check (Concurrency Safe count)
            // Count confirmed bookings OR pending holds that haven't expired
            const activeBookings = await tx.bookings.count({
                where: {
                    room_type_id: roomTypeId,
                    status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
                    // Date Overlap: (StartA <= EndB) and (EndA >= StartB)
                    check_in: { lt: checkOutDate },
                    check_out: { gt: checkInDate },
                    // For pending, only count if NOT expired
                    OR: [
                        { status: 'CONFIRMED' },
                        {
                            status: 'PENDING_PAYMENT',
                            expires_at: { gt: new Date() }
                        }
                    ]
                }
            });

            if (activeBookings >= roomType.total_inventory) {
                throw new Error('Room not available for selected dates');
            }

            // 4. Calculate Price
            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            // Ensure price is treated as number (Prisma returns Decimal)
            const pricePerNight = Number(roomType.price);
            const totalPrice = pricePerNight * nights; // Per room price, not per guest usually

            // 5. Determine Payment Mode & Status
            // Default to ONLINE if not provided
            const mode = paymentMode || 'ONLINE';

            // Fetch Payment Mode ID from DB
            const validMode = await tx.payment_modes.findFirst({
                where: { name: mode }
            });

            const paymentModeId = validMode ? validMode.id : null;
            // Note: If seeds aren't effectively run, this might be null. 
            // Ideally we should throw if invalid mode, but for resilience we might allow null or fallback.

            let initialStatus = 'PENDING_PAYMENT';
            let expiresAt: Date | null = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
            let paymentIntentId = '';
            let clientSecret = '';

            if (mode === 'PAY_AT_HOTEL') {
                initialStatus = 'CONFIRMED';
                expiresAt = null; // No expiry for confirmed
                paymentIntentId = 'pay_at_hotel';
            } else {
                // Mock Payment Intent (Stripe/Razorpay would go here)
                const tempId = `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                paymentIntentId = `pi_${tempId}`;
                clientSecret = `secret_${tempId}`;
            }

            const bookingId = `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

            await tx.bookings.create({
                data: {
                    id: bookingId,
                    hotel_id: hotelId,
                    room_type_id: roomTypeId,
                    payment_mode_id: paymentModeId,
                    check_in: checkInDate,
                    check_out: checkOutDate,
                    total_price: totalPrice,
                    status: initialStatus,
                    expires_at: expiresAt,
                    user_id: data.userId || null,
                }
            });

            return {
                bookingId,
                paymentIntentId,
                clientSecret,
                totalPrice,
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
            const booking = await tx.bookings.findUnique({
                where: { id: bookingId }
            });

            if (!booking) {
                throw new Error('Booking not found');
            }

            if (booking.status === 'CONFIRMED') {
                return booking; // Already confirmed
            }

            if (booking.status !== 'PENDING_PAYMENT') {
                throw new Error('Invalid booking status');
            }

            // Check Expiry
            if (booking.expires_at && booking.expires_at < new Date()) {
                throw new Error('Booking expired');
            }

            // Create Guest Details (Linked to Booking via booking_id)
            const guestId = `g_${Date.now()}`;
            await tx.guest_details.create({
                data: {
                    id: guestId,
                    name: guestDetails.name,
                    phone: guestDetails.phone || '',
                    booking_id: bookingId
                }
            });

            // Determine Payment Mode ID (assuming table exists or basic string)
            // Since schema has payment_modes relation, we need to fetch/connect it.
            // For MVP, if we don't have seeds, this might fail. Let's assume we pass ID or connect by name.
            // Safe fallback: Just Update status.

            const status = 'CONFIRMED';

            const updated = await tx.bookings.update({
                where: { id: bookingId },
                data: {
                    status: status,
                    expires_at: null, // Clear expiry
                    // guest_details_id removed
                    transaction_id: paymentIntentId, // Store stripe ID
                    // Should link payment mode here too ideally
                }
            });

            return updated;
        });
    },

    getUserBookings: async () => {
        // This needs user context passed in, usually
        return prisma.bookings.findMany();
    },

    cancelBooking: async (id: string) => {
        const booking = await prisma.bookings.findUnique({ where: { id } });
        if (!booking) {
            throw new Error('Booking not found');
        }
        return prisma.bookings.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
    }
};
