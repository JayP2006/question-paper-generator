import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import ChartCard from "../components/ChartCard";
import api from "../services/api";

const COLORS = [
  "hsl(239, 84%, 67%)",
  "hsl(263, 70%, 66%)",
  "hsl(150, 60%, 45%)",
  "hsl(35, 90%, 55%)"
];

export default function Analytics() {

  const [topicData, setTopicData] = useState([]);
  const [difficultyData, setDifficultyData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {

      const res = await api.get("/analytics");

      setTopicData(res.data.topicData || []);
      setDifficultyData(res.data.difficultyData || []);
      setTrendData(res.data.trendData || []);

    } catch (err) {
      console.error("Analytics fetch failed", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Insights into your paper generation activity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Topic Coverage */}

        <ChartCard title="Topic Coverage">

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topicData} layout="vertical">
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis
                dataKey="topic"
                type="category"
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="hsl(239, 84%, 67%)"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </ChartCard>

        {/* Difficulty */}

        <ChartCard title="Difficulty Distribution">

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {difficultyData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

        </ChartCard>

        {/* Trend */}

        <ChartCard title="Generation Trend" className="lg:col-span-2">

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="papers"
                stroke="hsl(239, 84%, 67%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>

        </ChartCard>

      </div>

    </div>
  );
}