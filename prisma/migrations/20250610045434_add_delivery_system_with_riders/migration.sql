/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subtotalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cartitem` ADD COLUMN `userId` VARCHAR(191) NULL,
    MODIFY `sessionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `customerId` VARCHAR(191) NULL,
    ADD COLUMN `customerLatitude` DOUBLE NULL,
    ADD COLUMN `customerLongitude` DOUBLE NULL,
    ADD COLUMN `deliveryFee` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `estimatedDeliveryTime` DATETIME(3) NULL,
    ADD COLUMN `paymentMethod` ENUM('CASH', 'CREDIT_CARD', 'MOBILE_BANKING', 'E_WALLET') NOT NULL DEFAULT 'CASH',
    ADD COLUMN `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `riderId` VARCHAR(191) NULL,
    ADD COLUMN `specialInstructions` VARCHAR(191) NULL,
    ADD COLUMN `subtotalAmount` DOUBLE NOT NULL,
    MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED_RIDER', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `restaurant` ADD COLUMN `deliveryFee` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `minimumOrder` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('CUSTOMER', 'RESTAURANT_OWNER', 'RIDER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE `Rider` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `licenseNumber` VARCHAR(191) NULL,
    `vehicleType` ENUM('MOTORCYCLE', 'BICYCLE', 'CAR', 'WALK') NOT NULL DEFAULT 'MOTORCYCLE',
    `vehiclePlate` VARCHAR(191) NULL,
    `bankAccount` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `currentLatitude` DOUBLE NULL,
    `currentLongitude` DOUBLE NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `totalDeliveries` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Rider_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Delivery` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `riderId` VARCHAR(191) NOT NULL,
    `pickupLatitude` DOUBLE NULL,
    `pickupLongitude` DOUBLE NULL,
    `deliveryLatitude` DOUBLE NULL,
    `deliveryLongitude` DOUBLE NULL,
    `status` ENUM('ASSIGNED', 'GOING_TO_PICKUP', 'ARRIVED_PICKUP', 'PICKED_UP', 'GOING_TO_DELIVERY', 'ARRIVED_DELIVERY', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'ASSIGNED',
    `pickedUpAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `estimatedDistance` DOUBLE NULL,
    `actualDistance` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Delivery_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryTracking` (
    `id` VARCHAR(191) NOT NULL,
    `deliveryId` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `status` ENUM('ASSIGNED', 'GOING_TO_PICKUP', 'ARRIVED_PICKUP', 'PICKED_UP', 'GOING_TO_DELIVERY', 'ARRIVED_DELIVERY', 'DELIVERED', 'FAILED') NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `CartItem_userId_productId_key` ON `CartItem`(`userId`, `productId`);

-- AddForeignKey
ALTER TABLE `Rider` ADD CONSTRAINT `Rider_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_riderId_fkey` FOREIGN KEY (`riderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_riderId_fkey` FOREIGN KEY (`riderId`) REFERENCES `Rider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryTracking` ADD CONSTRAINT `DeliveryTracking_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Delivery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
