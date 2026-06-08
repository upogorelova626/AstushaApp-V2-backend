/*
  Warnings:

  - You are about to drop the column `fileKey` on the `task_attachments` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `task_attachments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storageKey]` on the table `task_attachments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originalName` to the `task_attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageKey` to the `task_attachments` table without a default value. This is not possible if the table is not empty.
  - Made the column `mimeType` on table `task_attachments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `task_attachments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "task_attachments_fileKey_key";

-- AlterTable
ALTER TABLE "task_attachments" DROP COLUMN "fileKey",
DROP COLUMN "fileName",
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "storageKey" TEXT NOT NULL,
ALTER COLUMN "fileUrl" DROP NOT NULL,
ALTER COLUMN "mimeType" SET NOT NULL,
ALTER COLUMN "size" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "task_attachments_storageKey_key" ON "task_attachments"("storageKey");
