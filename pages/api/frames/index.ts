import { Frame, ImageResponse } from "frog";

export const config = {
  runtime: "edge",
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default async function handler(req: Request) {
  const frame = new Frame({
    image: `${baseUrl}/api/frames/image`,
    text: "Track what you read. Mint a badge on Base.",
    intents: [
      {
        type: "button",
        label: "Open BookBase",
        action: baseUrl,
      },
      {
        type: "button",
        label: "Log a Book",
        action: `${baseUrl}?from=frame`,
      },
    ],
  });

  return frame.toResponse();
}
