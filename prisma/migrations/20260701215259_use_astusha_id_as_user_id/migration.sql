/*
  Warnings:

  - You are about to drop the column `astushaIdUserId` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_astushaIdUserId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "astushaIdUserId";
