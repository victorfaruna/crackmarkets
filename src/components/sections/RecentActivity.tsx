"use client";

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", stocks: 2487, bonds: 1800, other: 900 },
  { month: "Feb", stocks: 2800, bonds: 1900, other: 1000 },
  { month: "Mar", stocks: 2600, bonds: 2100, other: 1100 },
  { month: "Apr", stocks: 3200, bonds: 2200, other: 1200 },
  { month: "May", stocks: 3000, bonds: 2400, other: 1300 },
  { month: "Jun", stocks: 3745, bonds: 2600, other: 1400 },
  { month: "Jul", stocks: 3500, bonds: 2800, other: 1500 },
  { month: "Aug", stocks: 8987, bonds: 3200, other: 1600 },
];

const LEGEND = [
  { label: "Stocks", color: "#9b87f5" },
  { label: "Bonds", color: "#7AE25A" },
  { label: "Other Instruments", color: "#4B4B6B" },
];

const RecentActivityCard = () => {
  return (
    <div className="item-card min-h-150">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-secondary/80 text-lg  font-medium">
            Recent Activity
          </p>
          <div className="flex items-center gap-4">
            {LEGEND.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-sm shrink-0"
                  style={{ background: l.color }}
                />
                <span className="text-subtext text-[0.65rem]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="size-10 rounded-full bg-background flex items-center justify-center text-subtext hover:text-secondary transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradStocks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#9b87f5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBonds" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7AE25A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7AE25A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOther" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4B4B6B" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#4B4B6B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff08"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "#5b5b5b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a1a",
                border: "none",
                borderRadius: "12px",
                fontSize: "0.7rem",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
              cursor={{ stroke: "#ffffff20", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="other"
              stroke="#4B4B6B"
              strokeWidth={1.5}
              fill="url(#gradOther)"
            />
            <Area
              type="monotone"
              dataKey="bonds"
              stroke="#7AE25A"
              strokeWidth={1.5}
              fill="url(#gradBonds)"
            />
            <Area
              type="monotone"
              dataKey="stocks"
              stroke="#9b87f5"
              strokeWidth={1.5}
              fill="url(#gradStocks)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RecentActivityCard;
