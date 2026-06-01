/*
  Warnings:

  - Added the required column `toStageName` to the `task_workflow_history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "task_workflow_history" DROP CONSTRAINT "task_workflow_history_toStageId_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_workflowStageId_fkey";

-- DropIndex
DROP INDEX "project_teams_projectId_teamId_key";

-- AlterTable
ALTER TABLE "task_workflow_history" ADD COLUMN     "fromStageName" TEXT,
ADD COLUMN     "toStageName" TEXT NOT NULL,
ALTER COLUMN "toStageId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "project_workflow_stages_projectId_isStart_idx" ON "project_workflow_stages"("projectId", "isStart");

-- CreateIndex
CREATE INDEX "project_workflow_stages_projectId_isFinal_idx" ON "project_workflow_stages"("projectId", "isFinal");

-- CreateIndex
CREATE INDEX "tasks_projectId_workflowStageId_idx" ON "tasks"("projectId", "workflowStageId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "project_workflow_stages"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_workflow_history" ADD CONSTRAINT "task_workflow_history_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "project_workflow_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
