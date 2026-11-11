CREATE TABLE "versus_votes" (
	"duel_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"choice" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "versus_votes_duel_id_user_id_pk" PRIMARY KEY("duel_id","user_id"),
	CONSTRAINT "versus_duel_check" CHECK ("versus_votes"."duel_id" = 'lolo-vs-ricono'),
	CONSTRAINT "versus_choice_check" CHECK ("versus_votes"."choice" in ('lolo-chicken', 'ricono'))
);
--> statement-breakpoint
ALTER TABLE "versus_votes" ADD CONSTRAINT "versus_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "versus_votes" ADD CONSTRAINT "versus_votes_choice_restaurants_slug_fk" FOREIGN KEY ("choice") REFERENCES "public"."restaurants"("slug") ON DELETE no action ON UPDATE no action;