/*
  Warnings:

  - A unique constraint covering the columns `[astushaIdUserId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "astushaIdUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_astushaIdUserId_key" ON "users"("astushaIdUserId");
