import { randomUUID } from "crypto";

export async function publishToBuffer(input: {
  channelId: string;
  text: string;
  imageUrl?: string | null;
  accessToken: string;
}): Promise<{ postId: string }> {
  const assets = input.imageUrl
    ? [
        {
          image: {
            url: input.imageUrl
          }
        }
      ]
    : [];

  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            ... on PostActionSuccess {
              post {
                id
                text
              }
            }
            ... on MutationError {
              message
            }
          }
        }
      `,
      variables: {
        input: {
          text: input.text,
          channelId: input.channelId,
          schedulingType: "automatic",
          mode: "addToQueue",
          assets
        }
      }
    })
  });

  if (!response.ok) throw new Error(`Buffer failed: ${response.status} ${await response.text()}`);
  const payload = (await response.json()) as BufferGraphqlResponse;
  const result = payload.data?.createPost;
  if (result?.message) throw new Error(`Buffer mutation failed: ${result.message}`);
  return { postId: result?.post?.id ?? randomUUID() };
}

type BufferGraphqlResponse = {
  data?: {
    createPost?: {
      post?: { id: string; text?: string };
      message?: string;
    };
  };
  errors?: { message: string }[];
};
