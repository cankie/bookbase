import { app } from "frog";

export const config = {
  runtime: "edge",
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

app.frame("/", (c) =>
  c.res({
    image: `${baseUrl}/api/frames/image`,
    text: "Track what you read. Mint a badge on Base.",
    intents: [
      {
        type: "link",
        label: "Open BookBase",
        href: baseUrl,
      },
      {
        type: "link",
        label: "Log a Book",
        href: `${baseUrl}?from=frame`,
      },
    ],
  })
);

export default app.fetch;
