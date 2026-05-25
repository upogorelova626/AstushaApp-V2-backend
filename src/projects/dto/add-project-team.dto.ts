import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddProjectTeamDto {
  @ApiProperty({
    example: 'f0d7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID команды, которую добавляем в проект',
  })
  @IsUUID('4', {
    message: 'teamId must be a valid UUID',
  })
  teamId!: string;
}
