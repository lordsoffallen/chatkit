CREATE TABLE IF NOT EXISTS "pixabay" (
	"artifactId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"query" text NOT NULL,
	"totalHits" integer NOT NULL,
	"images" jsonb NOT NULL,
	"currentPage" integer DEFAULT 1 NOT NULL,
	"perPage" integer DEFAULT 5 NOT NULL,
	"imageType" text DEFAULT 'all' NOT NULL,
	"category" text,
	CONSTRAINT "pixabay_artifactId_createdAt_pk" PRIMARY KEY("artifactId","createdAt")
);
