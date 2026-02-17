'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { themeClasses } from '@/lib/theme-classes';

interface TopScorerData {
  playerName: string;
  goals: number;
  assists: number;
}

interface TopScorersChartProps {
  data: TopScorerData[];
}

export function TopScorersChart({ data }: TopScorersChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`h-64 flex items-center justify-center ${themeClasses.text.muted}`}>
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 0 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} tick={{ fill: '#6b7280' }} />
        <YAxis
          dataKey="playerName"
          type="category"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6b7280' }}
          width={100}
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
        <Bar dataKey="goals" fill="#ef4444" name="Goals" radius={[0, 4, 4, 0]} />
        <Bar dataKey="assists" fill="#3b82f6" name="Assists" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

