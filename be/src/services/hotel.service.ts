import { HotelRepository } from '../repositories/hotel.repo';
import { HotelDTO, SearchHotelRequestDTO, SearchHotelResponseDTO, toHotelDTO } from '../../apicontract';

export const HotelService = {
    searchHotels: async (params: SearchHotelRequestDTO): Promise<SearchHotelResponseDTO> => {
        const {
            query,
            checkIn,
            checkOut,
            guests,
            sortBy = 'rating',
            page = 1,
            limit = 12
        } = params;

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build Filter
        const whereClause: any = {};
        if (query) {
            whereClause.OR = [
                { name: { contains: query as string } },
                { city: { contains: query as string } }
            ];
        }

        // Fetch Data
        const allHotels = await HotelRepository.findMany(whereClause);

        // Availability Logic
        let availableHotels = allHotels;

        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const guestCount = Number(guests || 1);

            availableHotels = allHotels.filter(hotel => {
                return hotel.room_types.some(room => {
                    if (room.capacity < guestCount) return false;

                    const overlappingBookings = room.bookings.filter(booking => {
                        const bCheckIn = new Date(booking.check_in);
                        const bCheckOut = new Date(booking.check_out);
                        return (bCheckIn < checkOutDate) && (bCheckOut > checkInDate);
                    });

                    return room.total_inventory > overlappingBookings.length;
                });
            });
        } else if (guests) {
            const guestCount = Number(guests);
            availableHotels = allHotels.filter(hotel =>
                hotel.room_types.some(room => room.capacity >= guestCount)
            );
        }

        // Sorting
        if (sortBy === 'price_low') {
            availableHotels.sort((a: any, b: any) => Number(a.lowest_price) - Number(b.lowest_price));
        } else if (sortBy === 'price_high') {
            availableHotels.sort((a: any, b: any) => Number(b.lowest_price) - Number(a.lowest_price));
        } else {
            availableHotels.sort((a: any, b: any) => Number(b.rating) - Number(a.rating));
        }

        // Pagination
        const total = availableHotels.length;
        const paginatedHotels = availableHotels.slice(skip, skip + limitNum);

        // Transform
        const hotelDTOs: HotelDTO[] = paginatedHotels.map(h => toHotelDTO(h));

        return {
            data: hotelDTOs,
            meta: {
                total,
                page: pageNum,
                limit: limitNum
            }
        };
    },

    getHotelById: async (id: string): Promise<HotelDTO | null> => {
        const hotel = await HotelRepository.findById(id);
        if (!hotel) return null;
        return toHotelDTO(hotel);
    }
};
