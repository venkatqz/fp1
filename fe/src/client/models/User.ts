/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
export type User = {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    phone?: string;
};

