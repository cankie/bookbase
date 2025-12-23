// Next.js API route using Frog
import type { NextApiRequest, NextApiResponse } from 'next';
import { Frog, Button } from 'frog';

const app = new Frog({ title: 'BookBase', imageAspectRatio: '1.91:1' });
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

app.frame('/', (c) =>
  c.res({
    image: `${baseUrl}/api/frames/image`,
    intents: [
      {
        type: "button",
        label: "Open BookBase",
        action: baseUrl
      },
      {
        type: "button",
        label: "Log a Book",
        action: `${baseUrl}?from=frame`
      }
    ],
    text: "Track what you read. Mint a badge on Base."
  })
);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const request = new Request(`${baseUrl}${req.url}`, { method: req.method });
  const response = await app.fetch(request);
  response.headers.forEach((v, k) => res.setHeader(k, v));
  const text = await response.text();
  res.status(response.status).send(text);
}
