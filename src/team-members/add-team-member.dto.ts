import { IsIn, IsString } from 'class-validator';
import { TeamRole } from 'src/generated/prisma/enums';

export const ADDABLE_TEAM_ROLES = [TeamRole.ADMIN, TeamRole.MEMBER] as const;

export type AddableTeamRole = (typeof ADDABLE_TEAM_ROLES)[number];

export class AddTeamMemberDto {
  @IsString()
  userId!: string;

  @IsIn(ADDABLE_TEAM_ROLES)
  role!: AddableTeamRole;
}
