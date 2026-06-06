import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const polls = await prisma.poll.findMany({
      where: session?.user?.id
        ? { creatorId: session.user.id }
        : undefined,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        options: true,
        _count: {
          select: { votes: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const pollsWithTotalVotes = polls.map((poll) => ({
      ...poll,
      totalVotes: poll._count.votes,
    }));

    return NextResponse.json({ polls: pollsWithTotalVotes });
  } catch (error) {
    console.error("获取投票列表错误:", error);
    return NextResponse.json(
      { error: "获取投票列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, options, type, deadline } = body;

    if (!title || !options || !type || !deadline) {
      return NextResponse.json(
        { error: "请填写所有必填项" },
        { status: 400 }
      );
    }

    if (options.length < 2 || options.length > 10) {
      return NextResponse.json(
        { error: "投票选项数量必须在2到10个之间" },
        { status: 400 }
      );
    }

    if (type !== "single" && type !== "multiple") {
      return NextResponse.json(
        { error: "无效的投票类型" },
        { status: 400 }
      );
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        { error: "无效的截止时间" },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        description: description || null,
        type,
        deadline: deadlineDate,
        creatorId: session.user.id,
        options: {
          create: options.map((text: string) => ({ text })),
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        options: true,
      },
    });

    return NextResponse.json({ poll }, { status: 201 });
  } catch (error) {
    console.error("创建投票错误:", error);
    return NextResponse.json(
      { error: "创建投票失败" },
      { status: 500 }
    );
  }
}
