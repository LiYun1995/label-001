"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  Check,
  Share2,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface SharePageProps {
  params: { id: string };
}

export default function SharePage({ params }: SharePageProps) {
  const { id } = params;
  const router = useRouter();

  const [pollUrl, setPollUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [pollTitle, setPollTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `${window.location.origin}/polls/${id}`;
    setPollUrl(url);

    fetchPollInfo();
  }, [id]);

  const fetchPollInfo = async () => {
    try {
      const response = await fetch(`/api/polls/${id}`);
      const data = await response.json();
      if (response.ok && data.poll) {
        setPollTitle(data.poll.title);
      }
    } catch (err) {
      console.error("Failed to fetch poll info:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleViewPoll = () => {
    router.push(`/polls/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <Share2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          投票创建成功！
        </h1>
        <p className="text-gray-500">分享以下链接或二维码邀请他人参与</p>
      </div>

      <div className="card mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">投票标题</h2>
        <p className="text-lg font-semibold text-gray-800 mb-1">
          {pollTitle}
        </p>
      </div>

      <div className="card mb-6 flex flex-col items-center">
        <h2 className="text-sm font-medium text-gray-500 mb-4 self-start">
          扫码参与投票
        </h2>
        <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
          <QRCodeSVG
            value={pollUrl}
            size={200}
            level="H"
            includeMargin={false}
            fgColor="#1e3a8a"
          />
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          投票链接
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={pollUrl}
            readOnly
            className="input-field flex-1 text-sm text-gray-600 bg-gray-50"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              copied
                ? "bg-green-500 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleViewPoll}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          查看投票
          <ExternalLink className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push("/polls/create")}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          再创建一个
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        提示：每人每个投票只能投一次，请确保登录后再投票
      </p>
    </div>
  );
}
