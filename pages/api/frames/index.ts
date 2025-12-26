import type { NextApiRequest, NextApiResponse } from "next";
import { getFrameHtml } from "frog";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const html = getFrameHtml({
    image: `${baseUrl}/api/frames/image`,
    intents: [
      { label: "Open BookBase", href: baseUrl },
      { label: "Log a Book", href: `${baseUrl}?from=frame` },
    ],
    text: "Track what you read. Mint a badge on Base.",
  });

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  }) as any;
}
