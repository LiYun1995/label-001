import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const { commentId } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "评论不存在" },
        { status: 404 }
      );
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "无权删除此评论" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除评论错误:", error);
    return NextResponse.json(
      { error: "删除评论失败" },
      { status: 500 }
    );
  }
}
