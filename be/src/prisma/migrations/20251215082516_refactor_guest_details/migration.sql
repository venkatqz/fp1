/*
  Warnings:

  - You are about to drop the column `guest_details_id` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `booking_id` to the `guest_details` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_ibfk_4`;

-- AlterTable
ALTER TABLE `bookings` DROP COLUMN `guest_details_id`,
    ADD COLUMN `expires_at` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `guest_details` ADD COLUMN `booking_id` VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE INDEX `booking_id` ON `guest_details`(`booking_id`);

-- AddForeignKey
ALTER TABLE `guest_details` ADD CONSTRAINT `guest_details_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
