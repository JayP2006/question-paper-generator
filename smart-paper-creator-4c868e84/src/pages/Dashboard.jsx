import React, { useState, useEffect } from 'react';
import {
  FileText,
  BookOpen,
  Upload,
  Clock,
  Sparkles,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import ChartCard from '../components/ChartCard';
import { getDashboardStats } from '../services/api';

const COLORS = [
  'hsl(239, 84%, 67%)',
  'hsl(263, 70%, 66%)',
  'hsl(215, 16%, 47%)',
  'hsl(0, 84%, 60%)'
];

export default function Dashboard() {

  const [stats, setStats] = useState({
    totalSyllabus: 0,
    totalPapers: 0,
    totalGenerated: 0,
    questionBank: 0,
  });

  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [activity, setActivity] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchStats = async () => {

      try {

        const res = await getDashboardStats();

        const data = res.data;

        setStats({
          totalSyllabus: data.totalSyllabus || 0,
          totalPapers: data.totalPapers || 0,
          totalGenerated: data.totalGenerated || 0,
          questionBank: data.questionBank || 0,
        });

        setBarData(data.barData || []);
        setPieData(data.pieData || []);
        setActivity(data.activity || []);

      } catch (err) {

        console.error("Dashboard fetch failed", err);

      } finally {

        setLoading(false);

      }

    };

    fetchStats();

  }, []);

  const statCards = [
    { label: 'Syllabus Uploaded', value: stats.totalSyllabus, icon: Upload, color: 'text-primary' },
    { label: 'Previous Papers', value: stats.totalPapers, icon: FileText, color: 'text-accent' },
    { label: 'Generated Papers', value: stats.totalGenerated, icon: Sparkles, color: 'text-primary' },
    { label: 'Question Bank', value: stats.questionBank, icon: BookOpen, color: 'text-accent' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your AI paper generation activity
        </p>
      </div>

      {/* Stat Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {statCards.map((s, i) => (

          <div
            key={i}
            className="card-elevated p-5 flex items-center gap-4 animate-scale-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >

            <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>

            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                {loading ? "-" : s.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.label}
              </p>
            </div>

          </div>

        ))}

      </div>


      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard title="Papers Generated This Week">

          <ResponsiveContainer width="100%" height={220}>

            <BarChart data={barData}>

              <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />

              <YAxis axisLine={false} tickLine={false} className="text-xs" />

              <Tooltip />

              <Bar
                dataKey="papers"
                fill="hsl(239, 84%, 67%)"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </ChartCard>


        <ChartCard title="Difficulty Distribution">

          <ResponsiveContainer width="100%" height={220}>

            <PieChart>

              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >

                {pieData.map((_, i) => (

                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>


          <div className="flex justify-center gap-4 mt-2">

            {pieData.map((d, i) => (

              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >

                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i] }}
                />

                {d.name}

              </div>

            ))}

          </div>

        </ChartCard>

      </div>


      {/* Recent Activity */}

      <div className="card-elevated p-6">

        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Recent Activity
        </h3>

        <div className="space-y-3">

          {activity.length === 0 ? (

            <p className="text-sm text-muted-foreground">
              No recent activity
            </p>

          ) : (

            activity.map((a, i) => (

              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >

                <div className="flex items-center gap-3">

                  <div className="w-2 h-2 rounded-full bg-primary" />

                  <span className="text-sm text-foreground">
                    {a.text}
                  </span>

                </div>

                <span className="text-xs text-muted-foreground">
                  {a.time}
                </span>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );

}