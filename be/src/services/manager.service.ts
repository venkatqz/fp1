import { randomUUID } from 'crypto';
import { BookingRepository } from "../repositories/booking.repo";
import { HotelRepository } from "../repositories/hotel.repo";
import { RoomTypeRepository } from "../repositories/room_type.repo";

export const ManagerService = {
    getHotelsByManager: async (userId: string) => {
        const hotels: any[] = await HotelRepository.findByManager(userId) as any[];
        console.log(hotels);

        return hotels.map(h => ({
            id: h.id,
            name: h.name,
            city: h.city,
            address: h.address,
            description: h.description,
            rating: Number(h.rating || 0),
            lowestPrice: Number(h.lowest_price || 0),
            images: typeof h.images === 'string' ? JSON.parse(h.images) : (h.images || []),
            amenities: typeof h.amenity_names === 'string' ? JSON.parse(h.amenity_names) : (h.amenity_names || []),
            rooms: typeof h.room_summary === 'string' ? JSON.parse(h.room_summary) : (h.room_summary || [])
        }));
    },

    getBookingsByManager: async (userId: string) => {
        const bookings: any[] = await BookingRepository.findBookingsByManager(userId) as any[];

        return bookings.map(b => ({
            id: b.id,
            hotelName: b.hotel_name,
            status: b.status,
            checkIn: b.check_in,
            checkOut: b.check_out,
            totalPrice: Number(b.total_price),
            // Parse aggregated guests
            guests: typeof b.guest_list === 'string' ? JSON.parse(b.guest_list) : (b.guest_list || []),
            // Fallback for primary display
            guestName: (b.guest_list && b.guest_list.length > 0) ? (typeof b.guest_list === 'string' ? JSON.parse(b.guest_list)[0]?.name : b.guest_list[0]?.name) : (b.user_name || 'Unknown'),
            guestPhone: (b.guest_list && b.guest_list.length > 0) ? (typeof b.guest_list === 'string' ? JSON.parse(b.guest_list)[0]?.phone : b.guest_list[0]?.phone) : b.user_phone,
            guestEmail: (b.guest_list && b.guest_list.length > 0) ? (typeof b.guest_list === 'string' ? JSON.parse(b.guest_list)[0]?.email : b.guest_list[0]?.email) : b.user_email,
            rooms: b.room_summary
        }));
    },

    createHotel: async (userId: string, data: any) => {
        const hotelId = randomUUID();
        const images = JSON.stringify(data.images || []);

        await HotelRepository.create({
            ...data,
            id: hotelId,
            images: images,
            rating: 0,
            lowest_price: 0
        }, userId);

        return { message: 'Hotel created successfully', id: hotelId };
    },

    createRoomType: async (userId: string, data: any) => {
        const roomTypeId = randomUUID();
        const images = JSON.stringify(data.images || []);

        const affected = await RoomTypeRepository.create({
            ...data,
            id: roomTypeId,
            hotel_id: data.hotelId,
            images: images,
            total_inventory: Number(data.totalInventory),
            capacity: Number(data.capacity),
            price: Number(data.price)
        }, userId);

        if (affected === 0) {
            throw new Error('Create failed: You do not manage this hotel');
        }

        return { message: 'Room Type created successfully', id: roomTypeId };
    },

    updateHotel: async (userId: string, hotelId: string, data: any) => {
        if (data.images && Array.isArray(data.images)) {
            data.images = JSON.stringify(data.images);
        }

        const affected = await HotelRepository.update(hotelId, userId, data);
        if (affected === 0) {
            throw new Error('Update failed: Hotel not found or access denied');
        }
        return { message: 'Hotel updated successfully' };
    },

    deleteHotel: async (userId: string, hotelId: string) => {
        const affected = await HotelRepository.delete(hotelId, userId);
        if (affected === 0) {
            throw new Error('Delete failed: Hotel not found or access denied');
        }
        return { message: 'Hotel deleted successfully' };
    },

    updateRoomType: async (userId: string, roomTypeId: string, data: any) => {
        if (data.images && Array.isArray(data.images)) {
            data.images = JSON.stringify(data.images);
        }
        if (data.totalInventory !== undefined) data.total_inventory = Number(data.totalInventory);
        if (data.capacity !== undefined) data.capacity = Number(data.capacity);
        if (data.price !== undefined) data.price = Number(data.price);

        const affected = await RoomTypeRepository.update(roomTypeId, userId, data);
        if (affected === 0) {
            throw new Error('Update failed: Room Type not found or access denied');
        }
        return { message: 'Room Type updated successfully' };
    },

    deleteRoomType: async (userId: string, roomTypeId: string) => {
        const affected = await RoomTypeRepository.delete(roomTypeId, userId);
        if (affected === 0) {
            throw new Error('Delete failed: Room Type not found or access denied');
        }
        return { message: 'Room Type deleted successfully' };
    }
};
