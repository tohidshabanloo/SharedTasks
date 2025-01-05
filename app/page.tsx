import { getServerSession } from "next-auth/next";
import InitialPage from "./InitialPage";
import { getInitialBoard } from "@/lib/users";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const board = await getInitialBoard();

  return (
    <>
      {/* @ts-ignore */}
      <InitialPage
        board={board && JSON.parse(JSON.stringify(board))}
        session={session}
      />
    </>
  );
}
