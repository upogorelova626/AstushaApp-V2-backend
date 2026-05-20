import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LookupUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  identifier!: string;
}
