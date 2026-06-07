import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: pollId } = params;

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "投票不存在" },
        { status: 404 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { pollId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("获取评论列表错误:", error);
    return NextResponse.json(
      { error: "获取评论列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: pollId } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "投票不存在" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "评论内容不能为空" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "评论内容不能超过500字" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        pollId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("创建评论错误:", error);
    return NextResponse.json(
      { error: "创建评论失败" },
      { status: 500 }
    );
  }
}
