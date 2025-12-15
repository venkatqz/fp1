"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHotelDTO = toHotelDTO;
// Mapper function stub - in real app this should transform DB entity to DTO
function toHotelDTO(hotel) {
    return {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        address: hotel.address,
        description: hotel.description,
        rating: typeof hotel.rating === 'object' && hotel.rating !== null ? Number(hotel.rating) : Number(hotel.rating || 0), // Handle Decimal from Prisma
        lowestPrice: typeof hotel.lowest_price === 'object' && hotel.lowest_price !== null ? Number(hotel.lowest_price) : Number(hotel.lowest_price || 0),
        images: hotel.images ? JSON.parse(hotel.images) : [],
        amenities: hotel.hotel_amenities ? hotel.hotel_amenities.map((ha) => ({
            id: ha.amenities.id,
            name: ha.amenities.name,
            scopeId: ha.amenities.scope_id
        })) : [],
        rooms: hotel.room_types ? hotel.room_types.map((rt) => ({
            id: rt.id,
            name: rt.name,
            price: Number(rt.price),
            capacity: { adults: rt.capacity, children: 0 }, // Using capacity for adults, children hardcoded 0 for now
            available: rt.total_inventory, // Should calculate real availability, but for Details view static is okay for now or fetched via separate inventory check
            amenities: rt.room_amenities?.map((ra) => ra.amenities?.name) || []
        })) : []
    };
}
//# sourceMappingURL=apicontract.js.map