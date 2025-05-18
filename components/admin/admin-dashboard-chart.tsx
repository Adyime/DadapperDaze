"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Client component that receives data as props
export default function AdminDashboardChart({ data }: { data: any[] }) {
  const { theme } = useTheme()

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value}`, "Revenue"]}
          cursor={{ fill: "transparent" }}
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "0.375rem",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
