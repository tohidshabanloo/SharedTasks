import { authOptions } from "pages/api/auth/[...nextauth]";
import prisma from "./prisma";
import { getServerSession } from "next-auth/next";

export const getUser = async () => {
  const session = await getServerSession(authOptions);
  try {
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
        select: {
          id: true,
          boards: {
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return user;
    }
  } catch (error) {}
};

export const getBoard = async (id: string) => {
  const session = await getServerSession(authOptions);

  try {
    if (session?.user?.email) {
      const boards = await prisma.board.findMany({
        where: {
          id,
          user: {
            email: session.user.email,
          },
        },
        include: {
          Status: {
            include: {
              Task: {
                include: {
                  subtask: true,
                },
                orderBy: {
                  rank: "asc",
                },
              },
            },
          },
        },
      });
      if (boards.length === 0) throw new Error("Invalid Board");

      return boards[0];
    }
  } catch (error) {
    throw new Error("Something went wrong");
  }
};

export const getInitialBoard = async () => {
  const session = await getServerSession(authOptions);

  try {
    if (session?.user?.email) {
      prisma.board.create;
      const board = await prisma.board.findFirst({
        where: {
          user: {
            email: session.user.email,
          },
        },
        include: {
          Status: {
            include: {
              Task: {
                include: {
                  subtask: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return board;
    }
  } catch (error) {
    throw new Error("Something went wrong");
  }
};
