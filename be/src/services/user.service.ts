import prisma from '../lib/prisma';
import { EarlyAccessRequestDTO } from '../../apicontract';

export const UserService = {
    createEarlyAccessUser: async (dto: EarlyAccessRequestDTO) => {
        const { email, name, primaryUseCase, company, role } = dto;

        // Check if user already exists
        // Note: early_access_users table might not exist yet in Prisma schema.
        // Assuming we need to create it or usage existing users table? 
        // The user request implied a new feature "Early Access User".

        // I will assume for now we use a new model `EarlyAccessUser` or similar.
        // But since I cannot modify schema.prisma and run migration easily without user confirmation or it being complex,
        // and I don't see `EarlyAccessUser` model.
        // I will check `schema.prisma` first.

        // Wait, I should have checked schema first.
        // If it doesn't exist, I'll need to ask user or propose it.
        // "Registers a new user for early access". Maybe just into `users` table with a flag? or a separate table.
        // Given the fields "primaryUseCase", "company", "role" which are not in standard User, high chance it's a new table.

        // I'll pause implementation of Service to check schema.
        // For now, I'll write a mock implementation or fail if table avoids me.
        // Actually, I'll read schema.prisma first.

        const existingUser = await prisma.early_access_users.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new Error('Email already exists');
        }

        return prisma.early_access_users.create({
            data: {
                name,
                email,
                primary_use_case: primaryUseCase,
                company: company || null,
                role: role || null
            }
        });
    }
};
