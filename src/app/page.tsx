"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Vote, TrendingUp, Users, Loader2, PlusCircle } from "lucide-react";
import PollCard from "@/components/PollCard";
import type { Poll } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "loading") {
      fetchPolls();
    }
  }, [status]);

  const fetchPolls = async () => {
    try {
      const response = await fetch("/api/polls");
      const data = await response.json();

      if (response.ok) {
        setPolls(data.polls || []);
      }
    } catch (err) {
      console.error("Failed to fetch polls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = () => {
    if (!session) {
      router.push("/login?callbackUrl=/polls/create");
    } else {
      router.push("/polls/create");
    }
  };

  const stats = {
    totalPolls: polls.length,
    activePolls: polls.filter(
      (p) => p.isActive && new Date(p.deadline) > new Date()
    ).length,
    totalVotes: polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0),
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-xl shadow-blue-500/30">
          <Vote className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          在线投票系统
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          快速创建投票，实时查看结果，简单高效的意见收集工具
        </p>
        <button
          onClick={handleCreatePoll}
          className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          创建投票
        </button>
      </div>

      {session && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Vote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPolls}
              </p>
              <p className="text-sm text-gray-500">投票总数</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activePolls}
              </p>
              <p className="text-sm text-gray-500">进行中</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalVotes}
              </p>
              <p className="text-sm text-gray-500">总票数</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {session ? "我的投票" : "热门投票"}
        </h2>
        {session && (
          <button
            onClick={handleCreatePoll}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" />
            新建
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : polls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {session ? "还没有创建投票" : "暂无投票"}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {session
              ? "点击上方按钮创建您的第一个投票"
              : "登录后创建您的第一个投票"}
          </p>
          <button
            onClick={handleCreatePoll}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            创建投票
          </button>
        </div>
      )}
    </div>
  );
}
