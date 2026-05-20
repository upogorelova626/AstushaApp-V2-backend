import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

function trimStringValue(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class LookupTeamMemberCandidateQueryDto {
  @Transform(({ value }: { value: unknown }) => trimStringValue(value))
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}
