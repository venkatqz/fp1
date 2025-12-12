import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const HotelRepository = {
    findMany: async (where: Prisma.hotelsWhereInput) => {
        return prisma.hotels.findMany({
            where,
            include: {
                hotel_amenities: {
                    include: { amenities: true }
                },
                room_types: {
                    include: {
                        bookings: {
                            where: {
                                status: 'CONFIRMED',
                            }
                        }
                    }
                }
            }
        });
    },

    findById: async (id: string) => {
        return prisma.hotels.findUnique({
            where: { id },
            include: {
                hotel_amenities: {
                    include: { amenities: true }
                },
                room_types: {
                    include: {
                        room_amenities: {
                            include: { amenities: true }
                        }
                    }
                },
                reviews: {
                    include: { users: true },
                    orderBy: { date_created: 'desc' }
                }
            }
        });
    }
};
