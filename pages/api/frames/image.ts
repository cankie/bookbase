import { app } from "frog";

export const config = {
  runtime: "edge",
};

app.image("/api/frames/image", (c) => {
  return c.res({
    image: `https://placehold.co/1200x630/000000/FFFFFF?text=BOOKBASE`,
  });
});

export default app.fetch;
