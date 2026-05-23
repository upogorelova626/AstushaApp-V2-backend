-- CreateEnum
CREATE TYPE "ProjectPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterEnum
ALTER TYPE "ProjectWorkflowType" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "priority" "ProjectPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "task_workflow_history" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fromStageId" TEXT,
    "toStageId" TEXT NOT NULL,
    "movedById" TEXT,
    "previousPosition" INTEGER,
    "newPosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_workflow_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_workflow_history_taskId_idx" ON "task_workflow_history"("taskId");

-- CreateIndex
CREATE INDEX "task_workflow_history_fromStageId_idx" ON "task_workflow_history"("fromStageId");

-- CreateIndex
CREATE INDEX "task_workflow_history_toStageId_idx" ON "task_workflow_history"("toStageId");

-- CreateIndex
CREATE INDEX "task_workflow_history_movedById_idx" ON "task_workflow_history"("movedById");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_deadline_idx" ON "projects"("deadline");

-- CreateIndex
CREATE INDEX "tasks_workflowStageId_position_idx" ON "tasks"("workflowStageId", "position");

-- AddForeignKey
ALTER TABLE "task_workflow_history" ADD CONSTRAINT "task_workflow_history_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_workflow_history" ADD CONSTRAINT "task_workflow_history_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "project_workflow_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_workflow_history" ADD CONSTRAINT "task_workflow_history_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "project_workflow_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_workflow_history" ADD CONSTRAINT "task_workflow_history_movedById_fkey" FOREIGN KEY ("movedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
