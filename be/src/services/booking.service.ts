import { BookingRepository } from '../repositories/booking.repo';

export const BookingService = {
    createIntent: async (data: any) => {
        const { hotelId, roomTypeId, checkIn, checkOut, guests } = data;

        if (!hotelId || !roomTypeId || !checkIn || !checkOut) {
            throw new Error('Missing required fields');
        }

        // Mock calculation logic
        const nights = 1;
        const pricePerNight = 5000;
        const totalPrice = pricePerNight * nights * (guests || 1);

        const paymentIntentId = `pi_mock_${Date.now()}`;
        const clientSecret = `secret_mock_${Date.now()}`;

        return {
            paymentIntentId,
            clientSecret,
            totalPrice,
            currency: 'INR'
        };
    },

    confirmBooking: async (data: any) => {
        const { paymentIntentId, guestDetails } = data;

        if (!paymentIntentId) {
            throw new Error('Missing payment intent ID');
        }

        const newBooking = {
            id: `bk_${Date.now()}`,
            paymentIntentId,
            guestDetails,
            status: 'CONFIRMED',
            createdAt: new Date().toISOString()
        };

        BookingRepository.add(newBooking);

        return newBooking;
    },

    getUserBookings: async () => {
        return BookingRepository.findAll();
    },

    cancelBooking: async (id: string) => {
        const booking = BookingRepository.findById(id);
        if (!booking) {
            throw new Error('Booking not found');
        }
        return BookingRepository.updateStatus(id, 'CANCELED');
    }
};
