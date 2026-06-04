'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';

interface MoodChartProps {
  data: Array<{
    date: string;
    moodScore: number;
    urgeIntensity: number;
  }>;
}

export function MoodChart({ data }: MoodChartProps) {
  return (
    <div className="card p-6 parchment-glow">
      <h3 className="heading-md mb-6 text-on-surface">Your Journey (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8d4b00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8d4b00" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorUrge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbc2b0" vertical={false} />
          <XAxis dataKey="date" stroke="#554336" tick={{ fontSize: 12 }} />
          <YAxis stroke="#554336" domain={[0, 10]} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f9f9f8',
              border: '1px solid #dbc2b0',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#1a1c1c' }}
          />
          <Legend />
          <ReferenceLine x="Day 7" stroke="#887364" strokeDasharray="5 5" opacity={0.5} />
          <ReferenceLine x="Day 14" stroke="#887364" strokeDasharray="5 5" opacity={0.5} />
          <ReferenceLine x="Day 30" stroke="#887364" strokeDasharray="5 5" opacity={0.5} />
          <Area
            type="monotone"
            dataKey="moodScore"
            stroke="#8d4b00"
            fillOpacity={1}
            fill="url(#colorMood)"
            name="Mood Score"
          />
          <Area
            type="monotone"
            dataKey="urgeIntensity"
            stroke="#ba1a1a"
            fillOpacity={1}
            fill="url(#colorUrge)"
            name="Urge Intensity"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
