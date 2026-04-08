ALTER TYPE "artifact_kind" ADD VALUE 'image';--> statement-breakpoint
ALTER TYPE "artifact_tool_type" ADD VALUE 'image';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "image" (
	"artifactId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"operationType" text NOT NULL,
	"provider" text DEFAULT 'replicate' NOT NULL,
	"model" text NOT NULL,
	"prompt" text,
	"inputImageUrls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"outputImages" jsonb NOT NULL,
	"operations" jsonb NOT NULL,
	"latestOperationId" text,
	CONSTRAINT "image_artifactId_createdAt_pk" PRIMARY KEY("artifactId","createdAt")
);
