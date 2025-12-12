-- CreateTable
CREATE TABLE `amenities` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `scope_id` VARCHAR(50) NULL,

    INDEX `scope_id`(`scope_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `amenity_scopes` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NULL,
    `hotel_id` VARCHAR(50) NULL,
    `room_type_id` VARCHAR(50) NULL,
    `guest_details_id` VARCHAR(50) NULL,
    `payment_mode_id` VARCHAR(50) NULL,
    `check_in` DATE NOT NULL,
    `check_out` DATE NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `transaction_id` VARCHAR(100) NULL,

    INDEX `guest_details_id`(`guest_details_id`),
    INDEX `hotel_id`(`hotel_id`),
    INDEX `payment_mode_id`(`payment_mode_id`),
    INDEX `room_type_id`(`room_type_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guest_details` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotels` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `address` TEXT NOT NULL,
    `description` TEXT NULL,
    `rating` DECIMAL(3, 1) NULL DEFAULT 0.0,
    `lowest_price` DECIMAL(10, 2) NULL,
    `images` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_amenities` (
    `hotel_id` VARCHAR(50) NOT NULL,
    `amenity_id` VARCHAR(50) NOT NULL,

    INDEX `amenity_id`(`amenity_id`),
    PRIMARY KEY (`hotel_id`, `amenity_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_managers` (
    `hotel_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `is_active` BOOLEAN NULL DEFAULT true,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`hotel_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_modes` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(50) NOT NULL,
    `hotel_id` VARCHAR(50) NULL,
    `user_id` VARCHAR(50) NULL,
    `booking_id` VARCHAR(50) NULL,
    `rating` INTEGER NULL,
    `comment` TEXT NULL,
    `date_created` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `booking_id`(`booking_id`),
    INDEX `hotel_id`(`hotel_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_amenities` (
    `room_type_id` VARCHAR(50) NOT NULL,
    `amenity_id` VARCHAR(50) NOT NULL,

    INDEX `amenity_id`(`amenity_id`),
    PRIMARY KEY (`room_type_id`, `amenity_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_types` (
    `id` VARCHAR(50) NOT NULL,
    `hotel_id` VARCHAR(50) NULL,
    `name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `total_inventory` INTEGER NOT NULL,
    `images` TEXT NULL,

    INDEX `hotel_id`(`hotel_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `role_id` VARCHAR(50) NULL,
    `refresh_token` VARCHAR(500) NULL,
    `access_token` VARCHAR(500) NULL,

    UNIQUE INDEX `email`(`email`),
    INDEX `role_id`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `amenities` ADD CONSTRAINT `amenities_ibfk_1` FOREIGN KEY (`scope_id`) REFERENCES `amenity_scopes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`guest_details_id`) REFERENCES `guest_details`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`payment_mode_id`) REFERENCES `payment_modes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hotel_amenities` ADD CONSTRAINT `hotel_amenities_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hotel_amenities` ADD CONSTRAINT `hotel_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hotel_managers` ADD CONSTRAINT `hotel_managers_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hotel_managers` ADD CONSTRAINT `hotel_managers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `room_types` ADD CONSTRAINT `room_types_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
