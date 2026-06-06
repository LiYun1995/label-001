import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        options: {
          orderBy: {
            votes: "desc",
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "投票不存在" },
        { status: 404 }
      );
    }

    let hasVoted = false;
    if (session?.user?.id) {
      const vote = await prisma.vote.findUnique({
        where: {
          pollId_userId: {
            pollId: id,
            userId: session.user.id,
          },
        },
      });
      hasVoted = !!vote;
    }

    const isExpired = new Date(poll.deadline) < new Date();
    const isActive = poll.isActive && !isExpired;

    const pollWithDetails = {
      ...poll,
      totalVotes: poll._count.votes,
      hasVoted,
      isActive,
    };

    return NextResponse.json({ poll: pollWithDetails });
  } catch (error) {
    console.error("获取投票详情错误:", error);
    return NextResponse.json(
      { error: "获取投票详情失败" },
      { status: 500 }
    );
  }
}
