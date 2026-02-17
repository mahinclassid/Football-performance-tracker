'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { themeClasses } from '@/lib/theme-classes';

interface GoalsOverTimeData {
  date: string;
  goals: number;
  cumulativeGoals: number;
  opponent: string;
}

interface GoalsOverTimeChartProps {
  data: GoalsOverTimeData[];
}

export function GoalsOverTimeChart({ data }: GoalsOverTimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`h-64 flex items-center justify-center ${themeClasses.text.muted}`}>
        No data available
      </div>
    );
  }

  // Format date for display (show month/day)
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="displayDate"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6b7280' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6b7280' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            color: '#1f2937',
          }}
          labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="goals"
          stroke="#ef4444"
          strokeWidth={2}
          name="Goals per Match"
          dot={{ r: 4, fill: '#ef4444' }}
        />
        <Line
          type="monotone"
          dataKey="cumulativeGoals"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Cumulative Goals"
          dot={{ r: 4, fill: '#3b82f6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

