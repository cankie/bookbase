import { app } from "frog";

export const config = {
  runtime: "edge",
};

app.frame("/", (c) =>
  c.res({
    image: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frames/image`,
    intents: [
      { label: "Open BookBase", href: process.env.NEXT_PUBLIC_BASE_URL },
      { label: "Log a Book", href: `${process.env.NEXT_PUBLIC_BASE_URL}?from=frame` },
    ],
    text: "Track what you read. Mint a badge on Base.",
  })
);

export default app.fetch;
