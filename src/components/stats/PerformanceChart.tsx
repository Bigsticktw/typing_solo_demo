import { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { GameSession } from '../../store/useGameStore';

interface Props {
    data: GameSession[];
}

export const PerformanceChart = ({ data }: Props) => {
    const chartData = useMemo(() => {
        // 按時間排序並處理成圖表格式，顯示最近 30 場
        return [...data]
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-30)
            .map(s => ({
                time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                ppm: s.ppm,
                latency: s.avgLatency,
                accuracy: s.accuracy
            }));
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-[var(--keyboard-bg)] rounded-xl opacity-30">
                暫無練習紀錄
            </div>
        );
    }

    return (
        <div className="w-full h-80 bg-[var(--keyboard-bg)] p-4 rounded-xl shadow-inner border border-[var(--text-secondary)]/10">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--text-secondary)" opacity={0.1} />
                    <XAxis
                        dataKey="time"
                        stroke="var(--text-secondary)"
                        fontSize={10}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="var(--accent)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'PPM', angle: -90, position: 'insideLeft', fill: 'var(--accent)', fontSize: 10 }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="var(--text-primary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: '延遲 (ms)', angle: 90, position: 'insideRight', fill: 'var(--text-primary)', fontSize: 10 }}
                    />
                    <YAxis
                        yAxisId="accuracy"
                        orientation="right"
                        stroke="#10b981"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        label={{ value: '正確率 (%)', angle: 90, position: 'outside', fill: '#10b981', fontSize: 10, dx: 30 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-primary)',
                            borderColor: 'var(--text-secondary)',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ppm"
                        stroke="var(--accent)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'var(--accent)' }}
                        activeDot={{ r: 6 }}
                        name="PPM (命中速率)"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="latency"
                        stroke="var(--text-primary)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, fill: 'var(--text-primary)' }}
                        name="平均延遲 (ms)"
                    />
                    <Line
                        yAxisId="accuracy"
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#10b981' }}
                        name="正確率 (%)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
