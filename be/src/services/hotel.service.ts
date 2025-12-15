import { HotelRepository } from '../repositories/hotel.repo';
import { HotelDTO, SearchHotelRequestDTO, SearchHotelResponseDTO, toHotelDTO } from '../../apicontract';

export const HotelService = {
    searchHotels: async (params: SearchHotelRequestDTO): Promise<SearchHotelResponseDTO> => {
        const {
            query,
            checkIn,
            checkOut,
            limit = 12,
            page = 1,
            sortBy
        } = params;

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        // If specific dates aren't provided, default to a future range or handle simply
        // Ideally the API should enforce these for availability checks, but for flexibility:
        const cIn = checkIn || new Date().toISOString().split('T')[0];
        const cOut = checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];

        // Call the raw SQL method
        const rawHotels = await HotelRepository.findAvailableHotels(
            (query as string) || '',
            (cIn as string),
            (cOut as string),
            limitNum,
            skip,
            (sortBy as string) || 'rating'
        ) as unknown as any[];

        // Map raw results to DTO
        const hotelDTOs = rawHotels.map((h: any) => ({
            id: h.id,
            name: h.name,
            city: h.city,
            address: h.address,
            description: h.description,
            rating: Number(h.rating),
            avg_rating: Number(h.rating), // Mapping for new field
            starting_price: Number(h.starting_price || 0),
            lowestPrice: Number(h.starting_price || 0), // Kept for backward compatibility
            // Images are stored as JSON string in DB
            images: typeof h.images === 'string' ? JSON.parse(h.images) : h.images,

            hotel_amenities: h.hotel_amenities || '',
            manager_names: h.manager_names ? (typeof h.manager_names === 'string' ? JSON.parse(h.manager_names) : h.manager_names) : [],
            rooms_details: h.rooms_details ? (typeof h.rooms_details === 'string' ? JSON.parse(h.rooms_details) : h.rooms_details) : [],

            // Required for the strict 'Hotel' type
            amenities: [] // The new query returns a string list, old DTO expects objects. We might need to adjust or leave empty for the lightweight search view.
        }));

        return {
            data: hotelDTOs,
            meta: {
                total: hotelDTOs.length, // NOTE: Total count for pagination requires a separate count query or returning total found rows from SQL. For now, using result length.
                page: pageNum,
                limit: limitNum
            }
        };
    },

    getHotelById: async (id: string): Promise<HotelDTO | null> => {
        const hotel = await HotelRepository.findById(id);
        console.log(`[HotelService] findById(${id}) raw:`, JSON.stringify(hotel, null, 2));
        if (!hotel) return null;
        const dto = toHotelDTO(hotel);
        console.log(`[HotelService] findById(${id}) DTO:`, JSON.stringify(dto, null, 2));
        return dto;
    }
};
