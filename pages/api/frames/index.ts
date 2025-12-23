import { app } from "@/lib/frog";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return app.fetch(req, res);
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";

// MAIN FRAME
app.frame("/", (c) =>
  c.res({
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
  })
);
