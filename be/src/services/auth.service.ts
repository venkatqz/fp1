import { UserRepository } from '../repositories/user.repo';
import {
    hashPassword,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from '../lib/auth';
import {
    LoginRequestDTO,
    RegisterRequestDTO,
    AuthResponseDTO,
    UserRole,
    JWTPayload,
    RefreshTokenResponseDTO
} from '../../apicontract';

// Helper to get role ID
async function getRoleId(roleName: string): Promise<string> {
    const role = await UserRepository.findRoleByName(roleName);
    if (role) return role.id;

    // Create role if it doesn't exist
    const newId = `role_${roleName.toLowerCase()}`;
    return (await UserRepository.createRole({
        id: newId,
        name: roleName
    })).id;
}

export const AuthService = {
    register: async (dto: RegisterRequestDTO): Promise<AuthResponseDTO> => {
        const { name, email, password, phone, role } = dto;

        const existingUser = await UserRepository.findUnique({ email });
        if (existingUser) {
            throw new Error('Email already exists');
        }

        const passwordHash = await hashPassword(password);
        const targetRoleStr = role || 'CUSTOMER';
        const roleId = await getRoleId(targetRoleStr);
        const userId = `u_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const newUser = await UserRepository.create({
            id: userId,
            name,
            email,
            password_hash: passwordHash,
            phone: phone || null,
            roles: { connect: { id: roleId } } // Prisma create input for relation
        });

        // Generate Tokens
        const payload: JWTPayload = {
            userId: newUser.id,
            email: newUser.email,
            role: (newUser.roles?.name as UserRole) || 'CUSTOMER'
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Save tokens
        await UserRepository.update({
            where: { id: newUser.id },
            data: {
                refresh_token: refreshToken,
                access_token: accessToken
            }
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: (newUser.roles?.name as UserRole) || 'CUSTOMER',
                ...(newUser.phone ? { phone: newUser.phone } : {}),
                passwordHash: newUser.password_hash
            }
        };
    },

    login: async (dto: LoginRequestDTO): Promise<AuthResponseDTO> => {
        const { email, password } = dto;
        const user = await UserRepository.findUnique({ email });

        if (!user || !user.password_hash) {
            throw new Error('Invalid credentials');
        }

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: (user.roles?.name as UserRole) || 'CUSTOMER'
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await UserRepository.update({
            where: { id: user.id },
            data: {
                refresh_token: refreshToken,
                access_token: accessToken
            }
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: (user.roles?.name as UserRole) || 'CUSTOMER',
                ...(user.phone ? { phone: user.phone } : {}),
                passwordHash: user.password_hash
            }
        };
    },

    refreshToken: async (token: string): Promise<RefreshTokenResponseDTO> => {
        const payload = verifyRefreshToken(token);
        if (!payload) {
            throw new Error('Invalid or expired refresh token');
        }

        const user = await UserRepository.findUnique({ id: payload.userId });

        if (!user || user.refresh_token !== token) {
            throw new Error('Invalid refresh token state');
        }

        const newPayload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: (user.roles?.name as UserRole) || 'CUSTOMER'
        };

        const newAccessToken = generateAccessToken(newPayload);
        const newRefreshToken = generateRefreshToken(newPayload);

        await UserRepository.update({
            where: { id: user.id },
            data: {
                refresh_token: newRefreshToken,
                access_token: newAccessToken
            }
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    },

    logout: async (token: string): Promise<void> => {
        const payload = verifyRefreshToken(token);
        if (payload) {
            await UserRepository.update({
                where: { id: payload.userId },
                data: {
                    refresh_token: null,
                    access_token: null
                }
            });
        }
    }
};
