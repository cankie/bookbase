export const config = {
  runtime: "edge",
};

export default async function handler() {
  return fetch(
    "https://placehold.co/1200x630/000000/FFFFFF?text=BOOKBASE",
    {
      headers: { "Content-Type": "image/png" },
    }
  );
}
