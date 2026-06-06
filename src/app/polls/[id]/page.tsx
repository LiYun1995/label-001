"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Share2,
  Loader2,
  BarChart3,
  Calendar,
  Timer,
} from "lucide-react";
import VoteChart from "@/components/VoteChart";
import type { Poll } from "@/types";

interface PollDetailPageProps {
  params: { id: string };
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const { data: session, status } = useSession();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    fetchPoll();
  }, [id]);

  useEffect(() => {
    if (!poll) return;

    const updateTimeLeft = () => {
      const deadline = new Date(poll.deadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("已截止");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}天 ${hours}小时`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}小时 ${minutes}分钟`);
      } else {
        setTimeLeft(`${minutes}分钟`);
      }
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [poll]);

  const fetchPoll = async () => {
    try {
      const response = await fetch(`/api/polls/${id}`);
      const data = await response.json();

      if (response.ok) {
        setPoll(data.poll);
      } else {
        setError(data.error || "加载失败");
      }
    } catch (err) {
      setError("加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (optionId: string) => {
    if (!poll?.isActive || poll.hasVoted || !session) return;

    if (poll.type === "single") {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleSubmitVote = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/polls/${id}`);
      return;
    }

    if (selectedOptions.length === 0) {
      setError("请选择至少一个选项");
      return;
    }

    setVoting(true);
    setError("");

    try {
      const response = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionIds: selectedOptions }),
      });

      const data = await response.json();

      if (response.ok) {
        setPoll(data.poll);
        setSelectedOptions([]);
      } else {
        setError(data.error || "投票失败");
      }
    } catch (err) {
      setError("投票失败，请稍后重试");
    } finally {
      setVoting(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (!poll || poll.totalVotes === 0) return 0;
    return (votes / poll.totalVotes) * 100;
  };

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">出错了</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  const showResults = poll.hasVoted || !poll.isActive;

  return (
    <div className="max-w-3xl mx-auto py-8 animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 text-sm mb-4 flex items-center gap-1"
        >
          ← 返回
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  poll.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {poll.isActive ? "进行中" : "已结束"}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                {poll.type === "single" ? "单选" : "多选"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {poll.title}
            </h1>
            {poll.description && (
              <p className="text-gray-500">{poll.description}</p>
            )}
          </div>
          <button
            onClick={() => router.push(`/polls/${id}/share`)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="分享"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{poll.totalVotes} 人参与</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>截止：{formatDate(poll.deadline)}</span>
          </div>
          {poll.isActive && (
            <div className="flex items-center gap-2 text-blue-600">
              <Timer className="w-4 h-4" />
              <span>剩余 {timeLeft}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {poll.hasVoted && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          您已成功投票
        </div>
      )}

      {!poll.isActive && !poll.hasVoted && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          该投票已截止，无法再投票
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          投票选项
        </h2>

        <div className="space-y-3">
          {poll.options.map((option, index) => {
            const percentage = getPercentage(option.votes);
            const isSelected = selectedOptions.includes(option.id);
            const canVote = poll.isActive && !poll.hasVoted && !!session;

            return (
              <div
                key={option.id}
                onClick={() => canVote && handleOptionClick(option.id)}
                className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  canVote
                    ? "cursor-pointer hover:border-blue-300 hover:shadow-sm"
                    : "cursor-default"
                } ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                {showResults && (
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      } ${
                        poll.type === "multiple" ? "rounded-md" : "rounded-full"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-800">
                      {option.text}
                    </span>
                  </div>

                  {showResults && (
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-sm font-semibold text-gray-700">
                        {option.votes} 票
                      </span>
                      <span className="text-sm font-bold text-blue-600 w-14 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {poll.isActive && !poll.hasVoted && (
          <div className="mt-6">
            {session ? (
              <button
                onClick={handleSubmitVote}
                disabled={voting || selectedOptions.length === 0}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                {voting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    提交中...
                  </>
                ) : (
                  "提交投票"
                )}
              </button>
            ) : (
              <button
                onClick={() =>
                  router.push(`/login?callbackUrl=/polls/${id}`)
                }
                className="btn-primary w-full py-4 text-lg"
              >
                登录后投票
              </button>
            )}
          </div>
        )}
      </div>

      {showResults && poll.totalVotes > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            结果统计
          </h2>
          <VoteChart options={poll.options} totalVotes={poll.totalVotes} />
        </div>
      )}
    </div>
  );
}
