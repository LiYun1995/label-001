"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Send,
  Trash2,
  Loader2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import type { Comment } from "@/types";

interface CommentSectionProps {
  pollId: string;
}

export default function CommentSection({ pollId }: CommentSectionProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComments();
  }, [pollId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/polls/${pollId}/comments`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments);
      } else {
        setError(data.error || "加载评论失败");
      }
    } catch (err) {
      setError("加载评论失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push(`/login?callbackUrl=/polls/${pollId}`);
      return;
    }

    if (!content.trim()) {
      setError("请输入评论内容");
      return;
    }

    if (content.length > 500) {
      setError("评论内容不能超过500字");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/polls/${pollId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments((prev) => [data.comment, ...prev]);
        setContent("");
      } else {
        setError(data.error || "发表评论失败");
      }
    } catch (err) {
      setError("发表评论失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("确定要删除这条评论吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        const data = await response.json();
        setError(data.error || "删除评论失败");
      }
    } catch (err) {
      setError("删除评论失败，请稍后重试");
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDisplayName = (user: Comment["user"]) => {
    return user.name || user.email.split("@")[0];
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        评论区
        <span className="text-sm font-normal text-gray-400">
          ({comments.length})
        </span>
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {status === "loading" ? null : session ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {getDisplayName(session.user).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你的评论..."
                className="input-field resize-none min-h-[80px]"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {content.length}/500
                </span>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      发表评论
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-500">
            <LogIn className="w-5 h-5" />
            <span className="text-sm">登录后发表评论，参与讨论</span>
          </div>
          <button
            onClick={() => router.push(`/login?callbackUrl=/polls/${pollId}`)}
            className="btn-secondary py-1.5 px-4 text-sm"
          >
            去登录
          </button>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无评论，快来抢沙发吧～</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {getDisplayName(comment.user).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-sm">
                      {getDisplayName(comment.user)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  {session?.user?.id === comment.userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                      title="删除评论"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1 break-words whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
