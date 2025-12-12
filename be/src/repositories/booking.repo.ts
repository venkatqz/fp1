
// Mock in-memory storage for bookings
export const BookingRepository = {
    // Shared mock state
    mockBookings: [
        {
            id: 'bk_mock_1',
            hotelId: 'h_1',
            hotelName: 'Grand Royal Hotel',
            roomName: 'Deluxe Suite',
            checkIn: '2024-12-15',
            checkOut: '2024-12-20',
            totalPrice: 25000,
            status: 'CONFIRMED',
            userId: 'u_1'
        }
    ] as any[],

    add: (booking: any) => {
        BookingRepository.mockBookings.push(booking);
        return booking;
    },

    findAll: () => {
        return BookingRepository.mockBookings;
    },

    findById: (id: string) => {
        return BookingRepository.mockBookings.find(b => b.id === id);
    },

    updateStatus: (id: string, status: string) => {
        const booking = BookingRepository.mockBookings.find(b => b.id === id);
        if (booking) {
            booking.status = status;
        }
        return booking;
    }
};
