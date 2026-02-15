"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface CategoricalBarChartProps {
  variables: any[]
  title?: string
}

interface ChartData {
  name: string
  count: number
  percentage: number
}

export function CategoricalBarChart({ variables, title = "Variables Categóricas" }: CategoricalBarChartProps) {
  const chartData = useMemo(() => {
    return variables
      .filter(variable => variable && (variable.variable || variable.name) && variable.dtype === 'categorical') // Filtrar variables categóricas
      .map((variable, index) => ({
        id: `var-${index}-${variable.variable || variable.name || 'unknown'}`,
        name: variable.variable || variable.name || `Variable-${index}`,
        count: Number(variable.non_null_count) || 0,
        percentage: Number(variable.valid_percentage) || 0,
        categories: variable.categories || []
      }))
      .filter(item => item.count > 0) // Filtrar datos válidos
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 variables
  }, [variables])

  const COLORS = [
    "hsl(199, 89%, 48%)",
    "hsl(160, 84%, 39%)",
    "hsl(35, 92%, 53%)",
    "hsl(346, 77%, 50%)",
    "hsl(47, 96%, 53%)",
    "hsl(280, 65%, 60%)",
    "hsl(199, 89%, 68%)",
    "hsl(160, 84%, 55%)",
    "hsl(35, 92%, 68%)",
    "hsl(346, 77%, 68%)",
  ]

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) {
    if (!active || !payload?.length) return null
    const data = payload[0].payload

    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
        <p className="mb-2 text-sm font-semibold text-foreground">{data.name}</p>
        <div className="grid gap-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Count:</span>
            <span className="font-mono font-semibold text-foreground">{data.count.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Percentage:</span>
            <span className="font-mono font-semibold" style={{ color: "hsl(160, 84%, 39%)" }}>
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No hay variables categóricas disponibles
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Top 10 variables por cantidad de valores no nulos
      </p>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 14%)" />
          <XAxis 
            type="number" 
            tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
                <Cell key={`cell-${entry.id}`} fill={COLORS[index % COLORS.length]} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
