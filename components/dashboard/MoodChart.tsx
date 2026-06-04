'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MoodChartProps {
  data: Array<{
    date: string;
    moodScore: number;
    urgeIntensity: number;
  }>;
}

export function MoodChart({ data }: MoodChartProps) {
  const [focusBar, setFocusBar] = useState<number | null>(null);

  const avgMood = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.moodScore, 0) / data.length * 10) / 10
    : 0
  const avgUrge = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.urgeIntensity, 0) / data.length * 10) / 10
    : 0

  return (
    <div className="card p-6 parchment-glow transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-on-surface">Your Journey (Last 30 Days)</h3>
        <div className="flex items-center gap-4 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[var(--color-primary)]" />
            Mood: {avgMood}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[var(--color-error)]" />
            Urge: {avgUrge}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          onMouseMove={(e) => {
            if (typeof e.activeTooltipIndex === 'number') setFocusBar(e.activeTooltipIndex)
          }}
          onMouseLeave={() => setFocusBar(null)}
        >
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorUrge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--color-on-surface-variant)"
            tick={{ fontSize: 10 }}
            tickFormatter={(v: string) => {
              const d = new Date(v)
              return `${d.getDate()}/${d.getMonth() + 1}`
            }}
          />
          <YAxis stroke="var(--color-on-surface-variant)" domain={[0, 10]} tick={{ fontSize: 10 }} ticks={[0, 2, 4, 6, 8, 10]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: '8px',
              color: 'var(--color-on-surface)',
            }}
            labelFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          />
          <Legend
            formatter={(value: string) => (
              <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px' }}>{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="moodScore"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorMood)"
            name="Mood Score"
            activeDot={{ r: 6, fill: 'var(--color-primary)' }}
          />
          <Area
            type="monotone"
            dataKey="urgeIntensity"
            stroke="var(--color-error)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUrge)"
            name="Urge Intensity"
            activeDot={{ r: 6, fill: 'var(--color-error)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
