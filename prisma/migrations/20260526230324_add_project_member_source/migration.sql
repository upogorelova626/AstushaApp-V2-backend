-- CreateEnum
CREATE TYPE "ProjectMemberSource" AS ENUM ('MANUAL', 'TEAM');

-- AlterTable
ALTER TABLE "project_members" ADD COLUMN     "source" "ProjectMemberSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "sourceTeamId" TEXT;

-- CreateIndex
CREATE INDEX "project_members_sourceTeamId_idx" ON "project_members"("sourceTeamId");

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_sourceTeamId_fkey" FOREIGN KEY ("sourceTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
