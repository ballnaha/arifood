/*
  Warnings:

  - A unique constraint covering the columns `[lineUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `restaurant` ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `lineUserId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_lineUserId_key` ON `User`(`lineUserId`);
