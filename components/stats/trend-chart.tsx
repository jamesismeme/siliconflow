'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface TrendChartProps {
  data: Array<{
    time: string
    total: number
    success: number
    failed?: number
    avgResponseTime?: number
  }>
  type?: 'line' | 'area'
  height?: number
  showResponseTime?: boolean
}

export function TrendChart({ 
  data, 
  type = 'area', 
  height = 300, 
  showResponseTime = false 
}: TrendChartProps) {
  // 格式化数据
  const chartData = data.map(item => ({
    ...item,
    time: new Date(item.time).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    failed: item.failed || (item.total - item.success),
    avgResponseTime: item.avgResponseTime ? item.avgResponseTime / 1000 : 0 // 转换为秒
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`时间: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.dataKey === 'avgResponseTime' ? 's' : ''}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 12 }} />
          {showResponseTime && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ value: '响应时间(s)', angle: 90, position: 'insideRight' }}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
            name="总调用"
          />
          <Area
            type="monotone"
            dataKey="success"
            stackId="2"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
            name="成功调用"
          />
          {showResponseTime && (
            <Area
              type="monotone"
              dataKey="avgResponseTime"
              stroke="#ffc658"
              fill="#ffc658"
              fillOpacity={0.3}
              name="平均响应时间(s)"
              yAxisId="right"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 12 }} />
        {showResponseTime && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            label={{ value: '响应时间(s)', angle: 90, position: 'insideRight' }}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="总调用"
        />
        <Line
          type="monotone"
          dataKey="success"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="成功调用"
        />
        <Line
          type="monotone"
          dataKey="failed"
          stroke="#ff7c7c"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="失败调用"
        />
        {showResponseTime && (
          <Line
            type="monotone"
            dataKey="avgResponseTime"
            stroke="#ffc658"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="平均响应时间(s)"
            yAxisId="right"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
