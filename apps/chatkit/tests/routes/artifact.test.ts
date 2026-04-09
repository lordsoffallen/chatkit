import type { Artifact } from "@/lib/db/schema";
import { getMessageByErrorCode } from "@/lib/errors";
import { generateUUID } from "@/lib/utils";
import { expect, test } from "../fixtures";

const artifactsCreatedByAda: Artifact[] = [];

test.describe
  .serial("/api/artifact", () => {
    test("Ada cannot retrieve a artifact without specifying an id", async ({
      adaContext,
    }) => {
      const response = await adaContext.request.get("/api/artifact");
      expect(response.status()).toBe(400);

      const { code, message } = await response.json();
      expect(code).toEqual("bad_request:api");
      expect(message).toEqual(getMessageByErrorCode(code));
    });

    test("Ada cannot retrieve a artifact that does not exist", async ({
      adaContext,
    }) => {
      const artifactId = generateUUID();

      const response = await adaContext.request.get(
        `/api/artifact?id=${artifactId}`
      );
      expect(response.status()).toBe(404);

      const { code, message } = await response.json();
      expect(code).toEqual("not_found:artifact");
      expect(message).toEqual(getMessageByErrorCode(code));
    });

    test("Ada can create a artifact", async ({ adaContext }) => {
      const artifactId = generateUUID();

      const draftArtifact = {
        title: "Ada's Artifact",
        kind: "text",
        content: "Created by Ada",
      };

      const response = await adaContext.request.post(
        `/api/artifact?id=${artifactId}`,
        {
          data: draftArtifact,
        }
      );
      expect(response.status()).toBe(200);

      const [createdArtifact] = await response.json();
      expect(createdArtifact).toMatchObject(draftArtifact);

      artifactsCreatedByAda.push(createdArtifact);
    });

    test("Ada can retrieve a created artifact", async ({ adaContext }) => {
      const [artifact] = artifactsCreatedByAda;

      const response = await adaContext.request.get(
        `/api/artifact?id=${artifact}`
      );
      expect(response.status()).toBe(200);

      const retrievedArtifacts = await response.json();
      expect(retrievedArtifacts).toHaveLength(1);

      const [retrievedArtifact] = retrievedArtifacts;
      expect(retrievedArtifact).toMatchObject(artifact);
    });

    test("Ada can save a new version of the artifact", async ({
      adaContext,
    }) => {
      const [firstArtifact] = artifactsCreatedByAda;

      const draftArtifact = {
        title: "Ada's Artifact",
        kind: "text",
        content: "Updated by Ada",
      };

      const response = await adaContext.request.post(
        `/api/artifact?id=${firstArtifact.id}`,
        {
          data: draftArtifact,
        }
      );
      expect(response.status()).toBe(200);

      const [createdArtifact] = await response.json();
      expect(createdArtifact).toMatchObject(draftArtifact);

      artifactsCreatedByAda.push(createdArtifact);
    });

    test("Ada can retrieve all versions of her artifacts", async ({
      adaContext,
    }) => {
      const [firstArtifact, secondArtifact] = artifactsCreatedByAda;

      const response = await adaContext.request.get(
        `/api/artifact?id=${firstArtifact.id}`
      );
      expect(response.status()).toBe(200);

      const retrievedArtifacts = await response.json();
      expect(retrievedArtifacts).toHaveLength(2);

      const [firstRetrievedArtifact, secondRetrievedArtifact] =
        retrievedArtifacts;
      expect(firstRetrievedArtifact).toMatchObject(firstArtifact);
      expect(secondRetrievedArtifact).toMatchObject(secondArtifact);
    });

    test("Ada cannot delete a artifact without specifying an id", async ({
      adaContext,
    }) => {
      const response = await adaContext.request.delete("/api/artifact");
      expect(response.status()).toBe(400);

      const { code, message } = await response.json();
      expect(code).toEqual("bad_request:api");
      expect(message).toEqual(getMessageByErrorCode(code));
    });

    test("Ada cannot delete a artifact without specifying a timestamp", async ({
      adaContext,
    }) => {
      const [firstArtifact] = artifactsCreatedByAda;

      const response = await adaContext.request.delete(
        `/api/artifact?id=${firstArtifact.id}`
      );
      expect(response.status()).toBe(400);

      const { code, message } = await response.json();
      expect(code).toEqual("bad_request:api");
      expect(message).toEqual(getMessageByErrorCode(code));
    });

    test("Ada can delete a artifact by specifying id and timestamp", async ({
      adaContext,
    }) => {
      const [firstArtifact, secondArtifact] = artifactsCreatedByAda;

      const response = await adaContext.request.delete(
        `/api/artifact?id=${firstArtifact.id}&timestamp=${firstArtifact.createdAt}`
      );
      expect(response.status()).toBe(200);

      const deletedArtifacts = await response.json();
      expect(deletedArtifacts).toHaveLength(1);

      const [deletedArtifact] = deletedArtifacts;
      expect(deletedArtifact).toMatchObject(secondArtifact);
    });

    test("Ada can retrieve artifacts without deleted versions", async ({
      adaContext,
    }) => {
      const [firstArtifact] = artifactsCreatedByAda;

      const response = await adaContext.request.get(
        `/api/artifact?id=${firstArtifact.id}`
      );
      expect(response.status()).toBe(200);

      const retrievedArtifacts = await response.json();
      expect(retrievedArtifacts).toHaveLength(1);

      const [firstRetrievedArtifact] = retrievedArtifacts;
      expect(firstRetrievedArtifact).toMatchObject(firstArtifact);
    });

    test("Babbage cannot update Ada's artifact", async ({ babbageContext }) => {
      const [firstArtifact] = artifactsCreatedByAda;

      const draftArtifact = {
        title: "Babbage's Artifact",
        kind: "text",
        content: "Created by Babbage",
      };

      const response = await babbageContext.request.post(
        `/api/artifact?id=${firstArtifact.id}`,
        {
          data: draftArtifact,
        }
      );
      expect(response.status()).toBe(403);

      const { code, message } = await response.json();
      expect(code).toEqual("forbidden:artifact");
      expect(message).toEqual(getMessageByErrorCode(code));
    });

    test("Ada's artifacts did not get updated", async ({ adaContext }) => {
      const [firstArtifact] = artifactsCreatedByAda;

      const response = await adaContext.request.get(
        `/api/artifact?id=${firstArtifact.id}`
      );
      expect(response.status()).toBe(200);

      const artifactsRetrieved = await response.json();
      expect(artifactsRetrieved).toHaveLength(1);
    });
  });
