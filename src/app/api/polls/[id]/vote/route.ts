import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { optionIds } = body;

    if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      return NextResponse.json(
        { error: "请选择至少一个选项" },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: true,
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "投票不存在" },
        { status: 404 }
      );
    }

    const isExpired = new Date(poll.deadline) < new Date();
    if (!poll.isActive || isExpired) {
      return NextResponse.json(
        { error: "该投票已截止，无法再投票" },
        { status: 400 }
      );
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        pollId_userId: {
          pollId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "您已经投过票了" },
        { status: 400 }
      );
    }

    const validOptionIds = poll.options.map((opt) => opt.id);
    const allOptionsValid = optionIds.every((optId) =>
      validOptionIds.includes(optId)
    );

    if (!allOptionsValid) {
      return NextResponse.json(
        { error: "包含无效的投票选项" },
        { status: 400 }
      );
    }

    if (poll.type === "single" && optionIds.length > 1) {
      return NextResponse.json(
        { error: "单选投票只能选择一个选项" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const vote = await tx.vote.create({
        data: {
          pollId: id,
          userId: session.user.id,
          optionVotes: {
            create: optionIds.map((optionId) => ({
              optionId,
            })),
          },
        },
      });

      await tx.pollOption.updateMany({
        where: {
          id: { in: optionIds },
        },
        data: {
          votes: { increment: 1 },
        },
      });

      return vote;
    });

    const updatedPoll = await prisma.poll.findUnique({
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

    const pollWithDetails = {
      ...updatedPoll,
      totalVotes: updatedPoll!._count.votes,
      hasVoted: true,
      isActive: true,
    };

    return NextResponse.json({ poll: pollWithDetails }, { status: 201 });
  } catch (error) {
    console.error("投票错误:", error);
    return NextResponse.json(
      { error: "投票失败，请稍后重试" },
      { status: 500 }
    );
  }
}
