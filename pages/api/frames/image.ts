export const config = {
  runtime: "edge",
};

export default function handler() {
  const png = `
    iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAMAAAD1+NwPAAAAflBMVEX///8AAAD8/Px2dnYz
    MzO+vr6cnJy2trZqamqGhob39/fT09OAgICsrKzV1dXQ0NDf39+FhYVtbW1hYWGmpqaioqKW
    lpZ5eXl1dXVs bGzX19eioqKUlJQpKSkdHR2 +Pj5JSUm3t7c6OjqTk5PFxcWenp5vb28LCw
    sREREpKSnq6uqZmZlAQEB9fX3... (kısaltıldı)
  `;

  // basit bir placeholder PNG embed (base64)
  const img = Buffer.from(png, "base64");

  return new Response(img, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=0",
    },
  });
}
