import { Role } from "@/types";

export interface UserResponse {
  id: string;
	email: string;
	teamId?: number | null;
	firstName: string;
	lastName: string;
	role: Role;
	image?: string | null;
	emailVerified: boolean;
	deleteStatus: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateUserDto {
	email: string;
	firstName: string;
	lastName: string;
	role?: Role;
	teamId?: number | null;
	image?: string | null;
}

export interface UpdateUserDto {
	email?: string;
	firstName?: string;
	lastName?: string;
	image?: string | null;
	teamId?: number | null;
	role?: Role;
}

export interface UpdatePrivateUserDto {
	email?: string;
	firstName?: string;
	lastName?: string;
	image?: string;
	role?: Role;
	teamId?: number;
	emailVerified?: boolean;
}

export interface OptionsGetAllUserDTO {
	q?: string;
	role?: Role;
	emailVerified?: boolean;
	deleteStatus?: boolean;
}
