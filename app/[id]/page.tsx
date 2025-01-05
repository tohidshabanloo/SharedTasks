import React from "react";
import Board from "./Board";
import { getBoard } from "@/lib/users";

export default async function BoardPage({
  params,
}: {
  params: { id: string };
}) {
  const board = await getBoard(params.id);

  return (
    <>
      {/* @ts-ignore */}
      <Board board={JSON.parse(JSON.stringify(board))} />
    </>
  );
}
