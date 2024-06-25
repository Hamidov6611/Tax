import { IsHash, IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsHash('sha256')
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsJWT()
  refreshToken: string;
}
