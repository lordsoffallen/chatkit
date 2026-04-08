import { headers } from "next/headers";
import type {
  ArtifactKind,
  ArtifactToolType,
  AssetData,
} from "@/artifacts/types";
import { auth } from "@/lib/auth";
import { artifactQueries } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError(
      "bad_request:api",
      "Parameter id is missing"
    ).toResponse();
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new ChatSDKError("unauthorized:artifact").toResponse();
  }

  const artifacts = await artifactQueries.getAllById(id);
  const [artifact] = artifacts;

  if (!artifact) {
    return new ChatSDKError("not_found:artifact").toResponse();
  }
  if (artifact.userId !== session.user.id) {
    return new ChatSDKError("forbidden:artifact").toResponse();
  }

  return Response.json(artifacts, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError(
      "bad_request:api",
      "Parameter id is required."
    ).toResponse();
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new ChatSDKError("not_found:artifact").toResponse();
  }

  const {
    assetData,
    title,
    kind,
    toolType,
  }: {
    assetData: Omit<AssetData[ArtifactToolType], "artifactId" | "createdAt">;
    title: string;
    kind: ArtifactKind;
    toolType: ArtifactToolType;
  } = await request.json();

  const artifacts = await artifactQueries.getAllById(id);

  if (artifacts.length === 0) {
    return new ChatSDKError(
      "not_found:artifact",
      "Artifact not found. Cannot update a artifact that doesn't exist."
    ).toResponse();
  }

  const [existingArtifact] = artifacts;

  if (existingArtifact.userId !== session.user.id) {
    return new ChatSDKError("forbidden:artifact").toResponse();
  }

  const artifact = await artifactQueries.save({
    id,
    assetData,
    title,
    toolType,
    kind,
    userId: session.user.id,
    chatId: existingArtifact.chatId,
  });

  return Response.json(artifact, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const timestamp = searchParams.get("timestamp");

  if (!id) {
    return new ChatSDKError(
      "bad_request:api",
      "Parameter id is required."
    ).toResponse();
  }

  if (!timestamp) {
    return new ChatSDKError(
      "bad_request:api",
      "Parameter timestamp is required."
    ).toResponse();
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new ChatSDKError("unauthorized:artifact").toResponse();
  }

  const artifacts = await artifactQueries.getAllById(id);
  const [artifact] = artifacts;

  if (artifact.userId !== session.user.id) {
    return new ChatSDKError("forbidden:artifact").toResponse();
  }

  const artifactsDeleted = await artifactQueries.deleteByIdAfterTimestamp(
    id,
    new Date(timestamp)
  );

  return Response.json(artifactsDeleted, { status: 200 });
}
