PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sha` text NOT NULL,
	`path` text NOT NULL,
	`name` text NOT NULL,
	`thumbnail_path` text NOT NULL,
	`thumbnail_sha` text NOT NULL,
	`size` integer NOT NULL,
	`type` text NOT NULL,
	`category_id` integer NOT NULL,
	`create_date` integer NOT NULL,
	`update_date` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `images_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_images`("id", "sha", "path", "name", "thumbnail_path", "thumbnail_sha", "size", "type", "category_id", "create_date", "update_date") SELECT "id", "sha", "path", "name", "thumbnail_path", "thumbnail_sha", "size", "type", "category_id", "create_date", "update_date" FROM `images`;--> statement-breakpoint
DROP TABLE `images`;--> statement-breakpoint
ALTER TABLE `__new_images` RENAME TO `images`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `images_sha_unique` ON `images` (`sha`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_path_unique` ON `images` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_thumbnail_path_unique` ON `images` (`thumbnail_path`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_thumbnail_sha_unique` ON `images` (`thumbnail_sha`);--> statement-breakpoint
ALTER TABLE `user_session` ADD `device` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user_session` ADD `ip` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user_session` ADD `browser` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user_session` ADD `os` text NOT NULL;