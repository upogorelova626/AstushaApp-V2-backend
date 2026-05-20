import { IsIn } from 'class-validator';

export class UpdateTeamMemberDto {
  @IsIn(['ADMIN', 'MEMBER'])
  role!: 'ADMIN' | 'MEMBER';
}
