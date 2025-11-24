import type { NextApiRequest, NextApiResponse } from 'next';
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'image/svg+xml');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='#1b1bd6'/>
        <stop offset='100%' stop-color='#1313a6'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <rect x='40' y='40' width='1120' height='550' fill='rgba(0,0,64,0.25)' stroke='#0f0fd0' stroke-width='6'/>
    <text x='80' y='140' font-size='64' font-family='Courier New, monospace' fill='#c9c9ff'>BOOKBASE v1.0</text>
    <text x='80' y='210' font-size='36' font-family='Courier New, monospace' fill='#a3a3ff'>TRACK WHAT YOU READ. MINT A BADGE ON BASE.</text>
    <text x='80' y='280' font-size='28' font-family='Courier New, monospace' fill='#c9c9ff'>READY_</text>
    <text x='80' y='360' font-size='28' font-family='Courier New, monospace' fill='#c9c9ff'>OPEN MINI APP  ▶</text>
  </svg>`;
  res.status(200).send(svg);
}
