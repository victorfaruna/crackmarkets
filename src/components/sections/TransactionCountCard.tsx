"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

const weeklyData = [
  { label: "Mon", count: 40 },
  { label: "Tue", count: 65 },
  { label: "Wed", count: 55 },
  { label: "Thu", count: 80 },
  { label: "Fri", count: 70 },
  { label: "Sat", count: 90 },
  { label: "Sun", count: 50 },
];

const monthlyData = [
  { label: "W1", count: 280 },
  { label: "W2", count: 340 },
  { label: "W3", count: 420 },
  { label: "W4", count: 380 },
];

const TransactionCountCard = () => {
  const [filter, setFilter] = useState<"Weekly" | "Monthly">("Weekly");
  const data = filter === "Weekly" ? weeklyData : monthlyData;

  return (
    <div className="w-full h-full rounded-3xl bg-primary p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-subtext text-xs mb-1">Transaction Count</p>
          <p className="text-secondary font-rubik text-3xl font-light leading-none">
            $6,721<span className="text-xl">.48</span>
          </p>
        </div>
        <div className="flex items-center gap-1 bg-background rounded-full p-1">
          {(["Weekly", "Monthly"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                filter === f
                  ? "bg-primary text-secondary shadow-md"
                  : "text-subtext hover:text-secondary"
              }`}
            >
              {f}
            </button>
          ))}
          <button className="text-subtext hover:text-secondary transition-colors px-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={14} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#5b5b5b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#5b5b5b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a1a",
                border: "none",
                borderRadius: "12px",
                fontSize: "0.7rem",
                color: "#fff",
              }}
              cursor={{ fill: "#ffffff06" }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i % 2 === 0 ? "#7AE25A" : "#7AE25A55"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionCountCard;
