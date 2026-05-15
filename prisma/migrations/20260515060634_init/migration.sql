/*
  Warnings:

  - You are about to drop the column `color` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `iconUrl` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `projects` table. All the data in the column will be lost.
  - Added the required column `title` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "color",
DROP COLUMN "iconUrl",
DROP COLUMN "name",
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "about" TEXT,
ADD COLUMN     "position" TEXT;
