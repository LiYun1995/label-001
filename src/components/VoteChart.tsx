"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { PollOption } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface VoteChartProps {
  options: PollOption[];
  totalVotes: number;
}

const CHART_COLORS = [
  "rgba(59, 130, 246, 0.8)",
  "rgba(16, 185, 129, 0.8)",
  "rgba(245, 158, 11, 0.8)",
  "rgba(239, 68, 68, 0.8)",
  "rgba(139, 92, 246, 0.8)",
  "rgba(236, 72, 153, 0.8)",
  "rgba(6, 182, 212, 0.8)",
  "rgba(132, 204, 22, 0.8)",
  "rgba(249, 115, 22, 0.8)",
  "rgba(99, 102, 241, 0.8)",
];

const CHART_BORDER_COLORS = [
  "rgba(59, 130, 246, 1)",
  "rgba(16, 185, 129, 1)",
  "rgba(245, 158, 11, 1)",
  "rgba(239, 68, 68, 1)",
  "rgba(139, 92, 246, 1)",
  "rgba(236, 72, 153, 1)",
  "rgba(6, 182, 212, 1)",
  "rgba(132, 204, 22, 1)",
  "rgba(249, 115, 22, 1)",
  "rgba(99, 102, 241, 1)",
];

export default function VoteChart({ options, totalVotes }: VoteChartProps) {
  const labels = options.map((opt) => opt.text);
  const votes = options.map((opt) => opt.votes);
  const percentages = options.map((opt) =>
    totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : "0"
  );

  const data = {
    labels,
    datasets: [
      {
        label: "得票数",
        data: votes,
        backgroundColor: CHART_COLORS.slice(0, options.length),
        borderColor: CHART_BORDER_COLORS.slice(0, options.length),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const value = context.raw;
            const percentage = totalVotes > 0
              ? ((value / totalVotes) * 100).toFixed(1)
              : "0";
            return `${value} 票 (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
          },
          maxRotation: 0,
          autoSkip: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
          precision: 0,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart" as const,
    },
  };

  return (
    <div className="w-full h-80">
      <Bar data={data} options={chartOptions} />
    </div>
  );
}
