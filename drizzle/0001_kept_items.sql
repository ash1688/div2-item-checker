CREATE TABLE `kept_items` (
	`key` text PRIMARY KEY NOT NULL,
	`item` text NOT NULL,
	`scan_id` integer,
	`kept_at` integer NOT NULL
);
