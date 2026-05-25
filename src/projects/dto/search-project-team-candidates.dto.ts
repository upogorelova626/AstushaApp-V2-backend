// projects/dto/search-project-team-candidates.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchProjectTeamCandidatesDto {
  @ApiPropertyOptional({
    example: 'frontend',
    description: 'Поиск команды по названию',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;
}
