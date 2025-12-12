-- CreateTable
CREATE TABLE `early_access_users` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `primary_use_case` VARCHAR(255) NOT NULL,
    `company` VARCHAR(100) NULL,
    `role` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `email_early_access`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
