import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ForecastResponse } from '../types';

interface ForecastChartProps {
  forecast: ForecastResponse;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ forecast }) => {
  // Process data for the next 8 chunks (24 hours)
  const data = forecast.list.slice(0, 8).map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', hour12: true }),
    temp: Math.round(item.main.temp),
    pop: item.pop * 100
  }));

  return (
    <div className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mt-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">24h Forecast</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              tick={{fontSize: 10, fill: '#94a3b8'}} 
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis 
              hide 
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`${value}°C`, 'Temp']}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTemp)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastChart;
