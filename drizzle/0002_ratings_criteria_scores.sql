ALTER TABLE "ratings" ADD COLUMN "flavor_score" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "portion_score" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "service_score" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "place_score" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_flavor_score_range" CHECK ("ratings"."flavor_score" between 1 and 10);--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_portion_score_range" CHECK ("ratings"."portion_score" between 1 and 10);--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_service_score_range" CHECK ("ratings"."service_score" between 1 and 10);--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_place_score_range" CHECK ("ratings"."place_score" between 1 and 10);