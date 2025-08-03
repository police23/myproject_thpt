
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

const typeMap = {
  users: { key: 'users', color: '#8884d8', name: 'Người dùng mới' },
  results: { key: 'results', color: '#82ca9d', name: 'Lượt làm bài' },
  visits: { key: 'visits', color: '#ffc658', name: 'Lượt truy cập' },
};

function StatsChart({ data, type = 'results' }) {
  const config = typeMap[type] || typeMap['results'];
  const isEmpty = !Array.isArray(data) || data.length === 0 || data.every(d => !d[config.key]);
  return (
    <div style={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isEmpty ? (
        <span style={{ color: '#adb5bd', fontSize: 18 }}>Không có dữ liệu để hiển thị</span>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="date" tickFormatter={d => {
              const [y, m, day] = d.split('-');
              return `${day}/${m}`;
            }} />
            <YAxis allowDecimals={false} tickFormatter={v => Math.round(v)} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={config.key} stroke={config.color} name={config.name} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default StatsChart;
