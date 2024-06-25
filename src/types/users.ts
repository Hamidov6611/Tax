import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateUser {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @Matches(/\+998\d{9}$/)
    @IsNotEmpty()
    phoneNumber: string;
}

export class UpdateUser {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    @Matches(/\+998\d{9}$/)
    phoneNumber?: string;
}
