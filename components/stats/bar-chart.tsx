'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface BarChartProps {
  data: Array<{
    name: string
    value: number
    success?: number
    failed?: number
    color?: string
  }>
  height?: number
  type?: 'simple' | 'stacked'
  showValues?: boolean
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
]

export function CustomBarChart({ 
  data, 
  height = 300, 
  type = 'simple',
  showValues = false
}: BarChartProps) {
  // 为数据添加颜色
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length]
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ x, y, width, value }: any) => {
    if (!showValues) return null
    
    return (
      <text 
        x={x + width / 2} 
        y={y - 5} 
        fill="#666" 
        textAnchor="middle" 
        fontSize={12}
      >
        {value}
      </text>
    )
  }

  if (type === 'stacked') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="success" 
            stackId="a" 
            fill="#82ca9d" 
            name="成功"
            label={showValues ? <CustomLabel /> : undefined}
          />
          <Bar 
            dataKey="failed" 
            stackId="a" 
            fill="#ff7c7c" 
            name="失败"
            label={showValues ? <CustomLabel /> : undefined}
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          name="数量"
          label={showValues ? <CustomLabel /> : undefined}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
