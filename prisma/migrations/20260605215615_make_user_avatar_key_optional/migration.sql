/*
  Warnings:

  - A unique constraint covering the columns `[fileKey]` on the table `task_attachments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileKey` to the `task_attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "task_attachments" ADD COLUMN     "fileKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "task_attachments_fileKey_key" ON "task_attachments"("fileKey");
