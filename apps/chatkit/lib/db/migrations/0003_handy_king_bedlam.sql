DO $$ BEGIN
 CREATE TYPE "public"."document_kind" AS ENUM('text', 'sheet');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artifactId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"content" text NOT NULL,
	"kind" "document_kind" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_extension_suggestion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"documentId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"originalText" text NOT NULL,
	"suggestedText" text NOT NULL,
	"description" text,
	"isResolved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_extension_suggestion" ADD CONSTRAINT "document_extension_suggestion_documentId_document_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
