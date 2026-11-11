CREATE TABLE "rating_helpful_votes" (
	"rating_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rating_helpful_votes_rating_id_user_id_pk" PRIMARY KEY("rating_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "comment_status" "rating_status" DEFAULT 'visible' NOT NULL;--> statement-breakpoint
ALTER TABLE "rating_helpful_votes" ADD CONSTRAINT "rating_helpful_votes_rating_id_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."ratings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_helpful_votes" ADD CONSTRAINT "rating_helpful_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ratings_restaurant_feed_idx" ON "ratings" USING btree ("restaurant_id","status","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);