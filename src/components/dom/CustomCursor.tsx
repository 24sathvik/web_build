"use client";

import dynamic from "next/dynamic";

const CursorEngine = dynamic(
  () => import("./cursor/CursorEngine").then((m) => m.CursorEngine),
  { ssr: false }
);

export function CustomCursor() {
  return <CursorEngine />;
}
