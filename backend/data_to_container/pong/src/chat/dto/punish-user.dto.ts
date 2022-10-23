import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class PunishUserDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  roomId: string;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
