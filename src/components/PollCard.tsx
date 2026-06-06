"use client";

import Link from "next/link";
import { Clock, Users, ChevronRight, BarChart2 } from "lucide-react";
import type { Poll } from "@/types";

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const deadline = new Date(poll.deadline);
  const isExpired = deadline < new Date();
  const isActive = poll.isActive && !isExpired;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalVotes = poll.options?.reduce(
    (sum: number, opt: any) => sum + (opt.votes || 0),
    0
  );

  return (
    <Link
      href={`/polls/${poll.id}`}
      className="group block"
    >
      <div className="card h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isActive ? "进行中" : "已结束"}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            {poll.type === "single" ? "单选" : "多选"}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {poll.title}
        </h3>

        {poll.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {poll.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{totalVotes || 0} 票</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4" />
                <span>{poll.options?.length || 0} 选项</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              截止：{formatDate(deadline)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
