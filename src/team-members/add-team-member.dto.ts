import { IsIn, IsUUID } from 'class-validator';

export class AddTeamMemberDto {
  @IsUUID()
  userId!: string;

  @IsIn(['ADMIN', 'MEMBER'])
  role!: 'ADMIN' | 'MEMBER';
}
