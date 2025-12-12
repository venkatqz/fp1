import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const UserRepository = {
    findUnique: async (where: Prisma.usersWhereUniqueInput) => {
        return prisma.users.findUnique({
            where,
            include: {
                roles: true
            }
        });
    },

    create: async (data: Prisma.usersCreateInput) => {
        return prisma.users.create({
            data,
            include: {
                roles: true
            }
        });
    },

    update: async (params: {
        where: Prisma.usersWhereUniqueInput;
        data: Prisma.usersUpdateInput;
    }) => {
        const { where, data } = params;
        return prisma.users.update({
            where,
            data
        });
    },

    findRoleByName: async (name: string) => {
        return prisma.roles.findUnique({
            where: { name }
        });
    },

    createRole: async (data: Prisma.rolesCreateInput) => {
        return prisma.roles.create({
            data
        });
    }
};
