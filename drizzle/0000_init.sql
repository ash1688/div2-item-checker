CREATE TABLE `exotics_owned` (
	`name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `library_attributes` (
	`key` text PRIMARY KEY NOT NULL,
	`value` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `library_talents` (
	`name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `proficiency` (
	`type` text PRIMARY KEY NOT NULL,
	`rank` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`image_path` text NOT NULL,
	`ocr_text` text,
	`item` text,
	`verdict` text,
	`status` text NOT NULL,
	`error` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
