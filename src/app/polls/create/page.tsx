"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus,
  Trash2,
  Clock,
  ListChecks,
  CheckSquare,
  Loader2,
} from "lucide-react";

export default function CreatePollPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [type, setType] = useState<"single" | "multiple">("single");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/polls/create");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("请输入投票标题");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      setError("请至少填写2个投票选项");
      return;
    }

    if (!deadline) {
      setError("请选择投票截止时间");
      return;
    }

    if (new Date(deadline) <= new Date()) {
      setError("截止时间必须晚于当前时间");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          options: validOptions.map((opt) => opt.trim()),
          type,
          deadline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "创建投票失败");
      } else {
        router.push(`/polls/${data.poll.id}/share`);
      }
    } catch (err) {
      setError("创建投票失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">创建投票</h1>
        <p className="text-gray-500">创建一个新的投票并分享给他人</p>
      </div>

      <div className="card">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">投票标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-lg"
              placeholder="请输入投票标题"
              maxLength={100}
            />
          </div>

          <div>
            <label className="label">投票描述（选填）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              placeholder="添加投票描述..."
              rows={2}
              maxLength={500}
            />
          </div>

          <div>
            <label className="label">投票类型</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setType("single")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                  type === "single"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <ListChecks className="w-5 h-5" />
                <span className="font-medium">单选</span>
              </button>
              <button
                type="button"
                onClick={() => setType("multiple")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                  type === "multiple"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <CheckSquare className="w-5 h-5" />
                <span className="font-medium">多选</span>
              </button>
            </div>
          </div>

          <div>
            <label className="label">投票选项</label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="input-field pl-14"
                      placeholder={`选项 ${index + 1}`}
                      maxLength={200}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                添加选项
              </button>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {options.length}/10 个选项（至少2个）
            </p>
          </div>

          <div>
            <label className="label">截止时间</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-field pl-12"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                创建中...
              </>
            ) : (
              "创建投票"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
