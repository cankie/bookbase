import { ImageResponse } from "frog";

export const config = {
  runtime: "edge",
};

export default function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          color: "white",
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        BOOKBASE 📚
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
