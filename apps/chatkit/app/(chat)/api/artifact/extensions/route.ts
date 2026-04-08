import { headers } from "next/headers";
import { suggestionQueries } from "@/artifacts/document/db/queries";
import { artifactQueries } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { ChatSDKError } from "@/lib/errors";

export async function GET(request: Request) {
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
    return new ChatSDKError("unauthorized:artifact").toResponse();
  }

  const artifact = await artifactQueries.getById(id);

  if (!artifact) {
    return new ChatSDKError("not_found:artifact").toResponse();
  }

  if (artifact.userId !== session.user.id) {
    return new ChatSDKError("forbidden:artifact").toResponse();
  }

  if (artifact.toolType === "document") {
    const suggestions = await suggestionQueries.getAllByArtifactId(id);
    return Response.json({ suggestions }, { status: 200 });
  }

  return Response.json({}, { status: 200 });
}
