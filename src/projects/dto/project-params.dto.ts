import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ProjectIdParamDto {
  @ApiProperty({
    example: 'b5c9d6d5-4f6c-4a2f-9c2e-2d61c5d8d1a1',
    description: 'ID проекта',
  })
  @IsUUID()
  projectId!: string;
}

export class ProjectTeamParamDto extends ProjectIdParamDto {
  @ApiProperty({
    example: 'f0d7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID команды',
  })
  @IsUUID()
  teamId!: string;
}

export class ProjectTaskParamDto extends ProjectIdParamDto {
  @ApiProperty({
    example: 'a7d7d6f5-6c9e-4f2d-9c2e-2d61c5d8d1a1',
    description: 'ID задачи',
  })
  @IsUUID()
  taskId!: string;
}
