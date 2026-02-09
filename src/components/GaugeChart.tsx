
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Text } from 'recharts';

interface GaugeChartProps {
  value: number;
  label: string;
  color: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, label, color }) => {
  const data = [
    { name: 'Value', value: value },
    { name: 'Remaining', value: 100 - value },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-10">
        <span className="text-3xl font-bold block" style={{ color }}>{value}%</span>
        <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

export default GaugeChart;
