import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

const upsertAmenities = async (tx: any, roomTypeId: string, amenities: string[]) => {

    if (!amenities) return;

    // 1. Clear existing links for this room type
    await tx.room_amenities.deleteMany({
        where: { room_type_id: roomTypeId }
    });

    if (amenities.length === 0) return;

    for (const name of amenities) {
        // 2. Find or Create Amenity
        let amenity = await tx.amenities.findFirst({
            where: { name: name }
        });

        if (!amenity) {
            amenity = await tx.amenities.create({
                data: {
                    id: randomUUID(),
                    name: name
                }
            });
        }

        // 3. Link Amenity to Room Type
        await tx.room_amenities.create({
            data: {
                room_type_id: roomTypeId,
                amenity_id: amenity.id
            }
        });
    }
};

export const RoomTypeRepository = {
    create: async (data: any, userId: string) => {
        const { id, hotel_id, name, price, capacity, total_inventory, images, amenities } = data;

        return prisma.$transaction(async (tx) => {
            // Atomic check: Insert only if the user manages the hotel
            const result: any = await tx.$executeRaw`
                INSERT INTO room_types (id, hotel_id, name, price, capacity, total_inventory, images)
                SELECT ${id}, ${hotel_id}, ${name}, ${price}, ${capacity}, ${total_inventory}, ${images}
                FROM hotel_managers 
                WHERE hotel_id = ${hotel_id} AND user_id = ${userId} AND is_active = 1
                LIMIT 1
            `;

            const affected = Number(result);

            if (affected > 0 && amenities) {
                await upsertAmenities(tx, id, amenities);
            }

            return affected;
        });
    },

    update: async (id: string, userId: string, data: any) => {
        const allowedColumns = ['name', 'price', 'capacity', 'total_inventory', 'images'];
        const updateData: any = {};

        allowedColumns.forEach(col => {
            if (data[col] !== undefined) {
                updateData[col] = data[col];
            }
        });

        if (Object.keys(updateData).length === 0 && !data.amenities) return 0;

        return prisma.$transaction(async (tx) => {
            let count = 0;

            if (Object.keys(updateData).length > 0) {
                const result = await tx.room_types.updateMany({
                    where: {
                        id: id,
                        hotels: {
                            hotel_managers: {
                                some: {
                                    user_id: userId
                                }
                            }
                        }
                    },
                    data: updateData
                });
                count = result.count;
            } else {
                // Check access if only updating amenities
                const countResult = await tx.room_types.count({
                    where: {
                        id: id,
                        hotels: {
                            hotel_managers: {
                                some: {
                                    user_id: userId
                                }
                            }
                        }
                    }
                });
                count = countResult;
            }

            if (count > 0 && data.amenities) {
                await upsertAmenities(tx, id, data.amenities);
            }

            return count;
        });
    },

    delete: async (id: string, userId: string) => {
        return prisma.$transaction(async (tx) => {
            // 1. Verify ownership
            // We check if the room belongs to a hotel managed by the user
            const room = await tx.room_types.findFirst({
                where: {
                    id: id,
                    hotels: {
                        hotel_managers: { some: { user_id: userId, is_active: true } }
                    }
                }
            });

            if (!room) return 0;

            // 2. Delete Room Amenities
            await tx.room_amenities.deleteMany({
                where: { room_type_id: id }
            });

            // 3. Delete Room Type
            await tx.room_types.delete({
                where: { id: id }
            });

            return 1;
        });
    }
};
