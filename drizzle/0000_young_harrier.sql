CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sha` text NOT NULL,
	`path` text NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`category_id` integer NOT NULL,
	`create_date` integer NOT NULL,
	`update_date` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_sha_unique` ON `articles` (`sha`);--> statement-breakpoint
CREATE UNIQUE INDEX `articles_path_unique` ON `articles` (`path`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`create_date` integer NOT NULL,
	`update_date` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sha` text NOT NULL,
	`path` text NOT NULL,
	`name` text NOT NULL,
	`thumbnail_path` text NOT NULL,
	`thumbnail_sha` text NOT NULL,
	`size` integer NOT NULL,
	`type` text NOT NULL,
	`category_id` integer,
	`create_date` integer NOT NULL,
	`update_date` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `images_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_sha_unique` ON `images` (`sha`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_path_unique` ON `images` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_thumbnail_path_unique` ON `images` (`thumbnail_path`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_thumbnail_sha_unique` ON `images` (`thumbnail_sha`);--> statement-breakpoint
CREATE TABLE `images_category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`create_date` integer NOT NULL,
	`update_date` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_category_name_unique` ON `images_category` (`name`);--> statement-breakpoint
CREATE TABLE `user_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`create_date` integer NOT NULL,
	`expire_date` integer NOT NULL,
	`revoked` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`create_date` integer NOT NULL,
	`update_date` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);