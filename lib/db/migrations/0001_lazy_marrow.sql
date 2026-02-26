CREATE TABLE "private_channel_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"created_by" uuid NOT NULL,
	"expires_at" timestamp,
	"max_uses" integer,
	"uses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "private_channel_invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "private_channel_invites" ADD CONSTRAINT "private_channel_invites_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_channel_invites" ADD CONSTRAINT "private_channel_invites_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;